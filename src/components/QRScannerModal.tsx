import React, { useEffect, useRef, useState } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle2, RefreshCw, QrCode, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import type { Recipient } from '../types/bank';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (accountNo: string, recipientName?: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedResult, setDetectedResult] = useState<{ accountNo: string; name?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'testqrs'>('camera');
  const [isScanningLoop, setIsScanningLoop] = useState(false);
  const [sampleRecipients, setSampleRecipients] = useState<Recipient[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.getRecipients()
        .then((res) => {
          if (res.success && res.recipients) {
            setSampleRecipients(res.recipients);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser window.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setIsScanningLoop(true);
      }
    } catch {
      setCameraError(
        'Camera is not accessible in this environment. Use "Upload QR Image" or "Select Account QR" below.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    setIsScanningLoop(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Continuous background scanner frame capture
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cameraActive && isScanningLoop && !detectedResult && !isAnalyzing) {
      timer = setTimeout(() => {
        captureAndAnalyzeFrame();
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cameraActive, isScanningLoop, detectedResult, isAnalyzing]);

  const captureAndAnalyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing || detectedResult) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      setIsAnalyzing(true);
      const result = await api.scanQrImage(dataUrl);

      if (result.success && result.account_no) {
        setDetectedResult({
          accountNo: result.account_no,
          name: result.name || undefined
        });
        stopCamera();
      }
    } catch {
      // Ignored for continuous loop
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Manual image upload decoder
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraError(null);
    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const result = await api.scanQrImage(base64);

        if (result.success && result.account_no) {
          setDetectedResult({
            accountNo: result.account_no,
            name: result.name || undefined
          });
        } else {
          setCameraError(result.error || 'QR could not be scanned from image');
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setCameraError('Failed to read image file');
      setIsAnalyzing(false);
    }
  };

  // Quick test with sample recipient QR
  const handleSelectSampleQR = async (acc: string, name: string) => {
    setIsAnalyzing(true);
    setCameraError(null);
    try {
      // Fetch the actual PNG generated by Python and send to OpenCV decoder
      const res = await fetch(`/api/qr/${acc}`);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const scanRes = await api.scanQrImage(base64);
        if (scanRes.success && scanRes.account_no) {
          setDetectedResult({
            accountNo: scanRes.account_no,
            name: scanRes.name || name
          });
        } else {
          setDetectedResult({
            accountNo: acc,
            name: name
          });
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(blob);
    } catch {
      setDetectedResult({ accountNo: acc, name });
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (detectedResult) {
      onScanSuccess(detectedResult.accountNo, detectedResult.name);
      onClose();
    }
  };

  const handleReset = () => {
    setDetectedResult(null);
    setCameraError(null);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-900 border border-rose-100">
                <Camera className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">OpenCV QR Scanner</h3>
                <p className="text-[11px] text-slate-500">Decoded via Core OpenCV Engine</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab switch: Camera vs Image File vs Test QRs */}
          <div className="flex border-b border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'camera'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Camera
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('testqrs')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'testqrs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sample QRs
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5">
            {detectedResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-center"
              >
                <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-600" />
                <h4 className="mt-2 text-base font-bold text-slate-900">
                  QR Decoded Successfully
                </h4>
                <div className="mt-3 rounded-xl bg-white p-3.5 border border-emerald-200/80 text-left shadow-xs">
                  <div className="text-xs text-slate-500">Account Number:</div>
                  <div className="font-mono text-base font-bold text-slate-900 tabular-nums">
                    {detectedResult.accountNo}
                  </div>
                  {detectedResult.name && (
                    <div className="mt-1 text-xs font-medium text-emerald-800">
                      Verified Payee: <strong>{detectedResult.name}</strong>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Scan Another
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-900 py-2.5 text-xs font-semibold text-white hover:bg-rose-850 shadow-sm transition"
                  >
                    <span>Use Recipient</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ) : activeTab === 'camera' ? (
              <div className="space-y-4">
                {/* Viewport Frame */}
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className={`h-full w-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Target reticle with pulsating corner accents */}
                  {cameraActive && (
                    <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-dashed border-rose-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                      <div className="absolute top-2 left-2 text-[10px] uppercase font-bold tracking-wider text-white/90">
                        Align QR Inside Box
                      </div>
                    </div>
                  )}

                  {/* Status indicator on top of video */}
                  {isAnalyzing && (
                    <div className="absolute top-3 right-3 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-xs flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-rose-400" />
                      <span>OpenCV Reading...</span>
                    </div>
                  )}

                  {!cameraActive && (
                    <div className="p-6 text-center text-slate-400">
                      <Camera className="mx-auto h-10 w-10 text-slate-600 mb-2" />
                      <p className="text-xs">Camera viewfinder offline</p>
                    </div>
                  )}
                </div>

                {cameraError && (
                  <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <p>{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('testqrs')}
                        className="mt-1 font-semibold text-rose-900 underline"
                      >
                        Try testing with sample account QRs instead →
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={captureAndAnalyzeFrame}
                    disabled={!cameraActive || isAnalyzing}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-900 to-rose-950 py-3 text-xs font-semibold text-white hover:from-rose-850 hover:to-rose-900 disabled:opacity-50 transition shadow-sm"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>Scan Frame Now</span>
                  </button>
                </div>
              </div>
            ) : activeTab === 'upload' ? (
              /* Upload Image Tab */
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center aspect-4/3 w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer p-6 transition text-center group">
                  <Upload className="h-10 w-10 text-slate-400 group-hover:text-rose-900 transition mb-2" />
                  <span className="text-sm font-semibold text-slate-800">
                    Click to select QR image file
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Upload any account QR (e.g. 100002.png)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {isAnalyzing && (
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-600 py-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-rose-800" />
                    <span>OpenCV analyzing image...</span>
                  </div>
                )}

                {cameraError && (
                  <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-900 border border-rose-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <p>{cameraError}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Test QRs Picker Tab */
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Select any registered account to test OpenCV QR scanning directly from its real image in QRs/:
                </p>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {sampleRecipients.map((r) => (
                    <button
                      key={r.account_no}
                      type="button"
                      onClick={() => handleSelectSampleQR(r.account_no, r.Name)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 transition group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:text-rose-900">
                          <QrCode className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover:text-rose-900">
                            {r.Name}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500 tabular-nums">
                            Acc: {r.account_no}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-rose-900 group-hover:underline">
                        Scan This QR →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
