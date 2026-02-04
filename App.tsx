
import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Settings, 
  RefreshCw, 
  Scissors, 
  Info,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import { PHOTO_PRESETS, PhotoPreset, PhotoSize, CropArea } from './types';

const mmToPx = (mm: number, dpi: number = 300) => Math.round((mm * dpi) / 25.4);

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [preset, setPreset] = useState<PhotoPreset>('passport');
  const [customSize, setCustomSize] = useState<PhotoSize>({
    name: '커스텀',
    widthMm: 35,
    heightMm: 45,
    description: '사용자 지정 사이즈',
    guidelines: ['직접 입력한 사이즈에 맞춰 이미지를 자릅니다.']
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImage(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const resetImage = () => {
    setImage(null);
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
  };

  const getActiveSize = (): PhotoSize => {
    if (preset === 'custom') return customSize;
    return PHOTO_PRESETS[preset];
  };

  const activeSize = getActiveSize();
  const aspectRatio = activeSize.widthMm / activeSize.heightMm;

  const generateCroppedImage = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.src = image;
      await new Promise((resolve) => { img.onload = resolve; });
      const outputWidth = mmToPx(activeSize.widthMm);
      const outputHeight = mmToPx(activeSize.heightMm);
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      ctx.drawImage(
        img,
        croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0, outputWidth, outputHeight
      );
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `${activeSize.name.split(' ')[0]}_${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Scissors className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
              증명사진 <span className="text-blue-600">마스터</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              <CheckCircle2 className="w-3.5 h-3.5" /> 2024 최신 규격 반영
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 md:p-6 gap-6">
        
        {/* Editor Area */}
        <div className="flex-[3] flex flex-col gap-4">
          {!image ? (
            <div 
              className="flex-1 min-h-[500px] border-3 border-dashed border-slate-200 rounded-3xl bg-white flex flex-col items-center justify-center p-8 transition-all hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">편집할 사진을 업로드하세요</h2>
              <p className="text-slate-500 text-center max-w-sm mb-8 leading-relaxed">
                파일을 이곳에 끌어다 놓거나 버튼을 눌러 선택하세요.<br />
                모든 사진은 브라우저 내에서 안전하게 처리됩니다.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-2">
                내 컴퓨터에서 찾기
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 animate-in fade-in duration-500">
              <div className="relative flex-1 min-h-[450px] md:min-h-[550px] bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  rotation={rotation}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                  cropShape="rect"
                  showGrid={true}
                />
                
                {/* Visual Guides overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-40">
                   <div className="border border-white/50 w-full h-full max-w-[80%] max-h-[80%] rounded-full border-dashed" title="얼굴 가이드"></div>
                   <div className="absolute top-[30%] w-full border-t border-white/30"></div>
                   <div className="absolute top-[60%] w-full border-t border-white/30"></div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-medium border border-white/20">
                    마우스로 드래그하여 위치를 조정하고, 휠로 확대/축소하세요.
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>줌 (확대/축소)</span>
                    <span className="text-blue-600 font-mono">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1} max={3} step={0.01}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>회전</span>
                    <span className="text-blue-600 font-mono">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    value={rotation}
                    min={0} max={360} step={1}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls & Guidelines Panel */}
        <aside className="flex-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-1 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                용도 선택
              </h3>
              <p className="text-sm text-slate-500">규격에 맞는 사이즈를 선택해 주세요.</p>
            </div>

            <div className="flex flex-col gap-2.5">
              {(Object.keys(PHOTO_PRESETS) as Array<Exclude<PhotoPreset, 'custom'>>).map((key) => {
                const p = PHOTO_PRESETS[key];
                const isActive = preset === key;
                return (
                  <button
                    key={key}
                    onClick={() => setPreset(key)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all group relative overflow-hidden ${
                      isActive 
                        ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50' 
                        : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <div className={`font-bold text-sm ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{p.description}</div>
                      </div>
                      {isActive ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                  </button>
                );
              })}

              <button
                onClick={() => setPreset('custom')}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${
                  preset === 'custom' 
                    ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50' 
                    : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-bold text-sm ${preset === 'custom' ? 'text-blue-700' : 'text-slate-700'}`}>
                      직접 입력 (커스텀)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">원하는 mm 규격을 직접 설정</div>
                  </div>
                  {preset === 'custom' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
              </button>
            </div>

            {preset === 'custom' && (
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">가로 (mm)</label>
                    <input 
                      type="number" 
                      value={customSize.widthMm}
                      onChange={(e) => setCustomSize({...customSize, widthMm: Number(e.target.value)})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">세로 (mm)</label>
                    <input 
                      type="number" 
                      value={customSize.heightMm}
                      onChange={(e) => setCustomSize({...customSize, heightMm: Number(e.target.value)})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={generateCroppedImage}
                disabled={!image || isProcessing}
                className={`w-full py-4.5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.97] ${
                  !image || isProcessing
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:-translate-y-0.5'
                }`}
              >
                {isProcessing ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <Download className="w-6 h-6" />
                )}
                고화질 사진 저장
              </button>
              
              {image && (
                <button
                  onClick={resetImage}
                  className="w-full py-3 rounded-2xl font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center gap-2 transition-all border border-transparent hover:border-red-100"
                >
                  <RefreshCw className="w-4 h-4" />
                  새로운 사진 업로드
                </button>
              )}
            </div>
          </div>

          {/* Detailed Guidelines Card */}
          <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h4 className="flex items-center gap-2 font-black text-lg mb-4">
              <UserCheck className="w-6 h-6" />
              {activeSize.name} 상세 지침
            </h4>
            <div className="space-y-3">
              {activeSize.guidelines.map((guide, idx) => (
                <div key={idx} className="flex gap-3 text-sm leading-relaxed text-indigo-100 items-start">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p>{guide}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-white/10 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-[11px] text-indigo-200 leading-normal italic font-medium">
                * 위 규정은 대한민국 공식 규격이며, 규정을 준수하지 않을 경우 공공기관 심사에서 반려될 수 있습니다.
              </p>
            </div>
          </div>
        </aside>
      </main>

      <footer className="mt-auto py-10 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-slate-400 mb-2">
            <Info className="w-5 h-5" />
            <span className="text-sm font-medium">개인정보 보호: 업로드된 사진은 서버에 저장되지 않고 즉시 파기됩니다.</span>
          </div>
          <p className="text-xs text-slate-300 font-bold tracking-widest uppercase">
            &copy; 2024 Smart Photo Resizer Pro. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
