"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  Upload,
  Download,
  Loader2,
  Grid2x2,
  Scissors,
  ImageIcon,
  Trash2,
  Sparkles,
} from "lucide-react";

import { engineApi, getEngineAssetUrl } from "@/lib/engine-api";
import { useLayoutStore } from "@/stores/layout-store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const BG_COLORS = [
  { value: "#FFFFFF", label: "白", ring: "ring-zinc-400" },
  { value: "#438EDB", label: "蓝", ring: "ring-blue-400" },
  { value: "#D03F3F", label: "红", ring: "ring-red-400" },
] as const;

export default function LayoutEditorPage() {
  const {
    photoSizes,
    paperSizes,
    setSizes,
    uploadedPhoto,
    setUploadedPhoto,
    photoSize,
    paperSize,
    layoutMode,
    largeSize,
    smallSize,
    backgroundColor,
    cuttingGuides,
    setPhotoSize,
    setPaperSize,
    setLayoutMode,
    setLargeSize,
    setSmallSize,
    setBackgroundColor,
    setCuttingGuides,
    layoutResult,
    setLayoutResult,
    isUploading,
    isGenerating,
    setIsUploading,
    setIsGenerating,
  } = useLayoutStore();

  const [sizesError, setSizesError] = useState(false);

  useEffect(() => {
    engineApi
      .getSizes()
      .then((data) => setSizes(data.photo_sizes, data.paper_sizes))
      .catch(() => setSizesError(true));
  }, [setSizes]);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setIsUploading(true);
      try {
        const result = await engineApi.uploadPhoto(file);
        setUploadedPhoto(result);
        toast.success("照片上传成功");
      } catch {
        toast.error("上传失败，请重试");
      } finally {
        setIsUploading(false);
      }
    },
    [setIsUploading, setUploadedPhoto],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleGenerate = useCallback(async () => {
    if (!uploadedPhoto) {
      toast.error("请先上传照片");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await engineApi.createLayout(uploadedPhoto.photo_id, {
        photo_size: photoSize,
        paper_size: paperSize,
        layout_mode: layoutMode,
        ...(layoutMode === "mixed" && {
          large_size: largeSize,
          small_size: smallSize,
        }),
        options: {
          background_color: backgroundColor,
          cutting_guides: cuttingGuides,
        },
      });
      setLayoutResult(result);
      toast.success(`排版完成 · ${result.total_photos} 张`);
    } catch {
      toast.error("排版失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  }, [
    uploadedPhoto,
    photoSize,
    paperSize,
    layoutMode,
    largeSize,
    smallSize,
    backgroundColor,
    cuttingGuides,
    setIsGenerating,
    setLayoutResult,
  ]);

  const handleDownload = useCallback(() => {
    if (!layoutResult) return;
    window.open(engineApi.getDownloadUrl(layoutResult.layout_id), "_blank");
  }, [layoutResult]);

  const handleClearPhoto = useCallback(() => {
    setUploadedPhoto(null);
    setLayoutResult(null);
  }, [setUploadedPhoto, setLayoutResult]);

  const previewUrl = layoutResult
    ? engineApi.getPreviewUrl(layoutResult.layout_id)
    : null;

  return (
    <div className="flex min-h-[calc(100svh-3rem)] flex-col lg:flex-row">
      {/* ── Left: Upload ── */}
      <aside className="w-full shrink-0 border-b border-zinc-800 p-4 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
          <Upload className="size-3.5" />
          照片
        </div>

        {!uploadedPhoto ? (
          <div
            {...getRootProps()}
            className={`group flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              isDragActive
                ? "border-teal-500 bg-teal-500/5"
                : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50"
            } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <Loader2 className="size-8 animate-spin text-teal-500" />
            ) : (
              <>
                <ImageIcon className="mb-2 size-8 text-zinc-600 transition-colors group-hover:text-zinc-400" />
                <p className="text-sm text-zinc-500">
                  {isDragActive ? "释放上传" : "拖拽或点击上传"}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  JPG / PNG
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getEngineAssetUrl(uploadedPhoto.thumbnail_url)}
                alt="已上传照片"
                className="h-48 w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-500">
                {uploadedPhoto.width}×{uploadedPhoto.height}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleClearPhoto}
                className="text-zinc-500 hover:text-red-400"
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* ── Center: Preview ── */}
      <main className="flex flex-1 flex-col items-center justify-center bg-zinc-950 p-4 lg:p-8">
        {previewUrl ? (
          <div className="flex w-full max-w-2xl flex-col items-center gap-4">
            <div className="relative w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="排版预览"
                className="h-auto w-full"
              />
            </div>
            {layoutResult && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                <span className="font-mono">
                  {layoutResult.paper_width}×{layoutResult.paper_height}px
                </span>
                <span>·</span>
                <span>
                  共 <strong className="text-zinc-300">{layoutResult.total_photos}</strong> 张
                </span>
                {layoutResult.zones.map((z, i) => (
                  <span key={i} className="font-mono">
                    {z.photo_size_key} {z.rows}×{z.cols}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-zinc-600">
            <Grid2x2 className="size-16 stroke-[0.8]" />
            <p className="text-sm">
              {uploadedPhoto
                ? "配置参数后点击「生成排版」"
                : "上传照片开始排版"}
            </p>
          </div>
        )}
      </main>

      {/* ── Right: Config ── */}
      <aside className="w-full shrink-0 border-t border-zinc-800 p-4 lg:w-80 lg:border-t-0 lg:border-l">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
          <Sparkles className="size-3.5" />
          排版设置
        </div>

        <div className="space-y-5">
          {/* Photo size */}
          <fieldset className="space-y-1.5">
            <Label className="text-xs text-zinc-400">证件照尺寸</Label>
            {photoSizes.length > 0 ? (
              <Select
                value={photoSize}
                onValueChange={(val) => {
                  if (val) setPhotoSize(val as string);
                }}
              >
                <SelectTrigger className="w-full border-zinc-700 bg-zinc-900 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-900">
                  {photoSizes.map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      <span className="font-mono text-zinc-300">{s.name}</span>
                      <span className="ml-1 text-zinc-500">
                        {s.width_mm}×{s.height_mm}mm
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-8 animate-pulse rounded-lg bg-zinc-800" />
            )}
          </fieldset>

          {/* Paper size */}
          <fieldset className="space-y-1.5">
            <Label className="text-xs text-zinc-400">相纸尺寸</Label>
            {paperSizes.length > 0 ? (
              <Select
                value={paperSize}
                onValueChange={(val) => {
                  if (val) setPaperSize(val as string);
                }}
              >
                <SelectTrigger className="w-full border-zinc-700 bg-zinc-900 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-900">
                  {paperSizes.map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      <span className="font-mono text-zinc-300">{s.name}</span>
                      <span className="ml-1 text-zinc-500">
                        {s.width_mm}×{s.height_mm}mm
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-8 animate-pulse rounded-lg bg-zinc-800" />
            )}
          </fieldset>

          {/* Layout mode */}
          <fieldset className="space-y-1.5">
            <Label className="text-xs text-zinc-400">排版模式</Label>
            <div className="flex gap-1">
              {(["uniform", "mixed"] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={layoutMode === mode ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setLayoutMode(mode)}
                  className={
                    layoutMode === mode
                      ? "flex-1 border-zinc-600 bg-zinc-800 text-zinc-200"
                      : "flex-1 text-zinc-500 hover:text-zinc-300"
                  }
                >
                  {mode === "uniform" ? "统一" : "混排"}
                </Button>
              ))}
            </div>
          </fieldset>

          {/* Mixed mode size selectors */}
          {layoutMode === "mixed" && photoSizes.length > 0 && (
            <>
              <fieldset className="space-y-1.5">
                <Label className="text-xs text-zinc-400">大尺寸（上半区）</Label>
                <Select
                  value={largeSize}
                  onValueChange={(val) => {
                    if (val) setLargeSize(val as string);
                  }}
                >
                  <SelectTrigger className="w-full border-zinc-700 bg-zinc-900 text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-700 bg-zinc-900">
                    {photoSizes.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        <span className="font-mono text-zinc-300">{s.name}</span>
                        <span className="ml-1 text-zinc-500">
                          {s.width_mm}×{s.height_mm}mm
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </fieldset>
              <fieldset className="space-y-1.5">
                <Label className="text-xs text-zinc-400">小尺寸（下半区）</Label>
                <Select
                  value={smallSize}
                  onValueChange={(val) => {
                    if (val) setSmallSize(val as string);
                  }}
                >
                  <SelectTrigger className="w-full border-zinc-700 bg-zinc-900 text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-700 bg-zinc-900">
                    {photoSizes.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        <span className="font-mono text-zinc-300">{s.name}</span>
                        <span className="ml-1 text-zinc-500">
                          {s.width_mm}×{s.height_mm}mm
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </fieldset>
            </>
          )}

          <Separator className="bg-zinc-800" />

          {/* Background color */}
          <fieldset className="space-y-1.5">
            <Label className="text-xs text-zinc-400">背景颜色</Label>
            <div className="flex gap-2">
              {BG_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setBackgroundColor(c.value)}
                  className={`flex h-8 w-12 items-center justify-center rounded-md border text-xs transition-all ${
                    backgroundColor === c.value
                      ? `border-teal-500 ring-2 ring-teal-500/30`
                      : "border-zinc-700 hover:border-zinc-500"
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  <span
                    className={
                      c.value === "#FFFFFF" ? "text-zinc-800" : "text-white/80"
                    }
                  >
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Cutting guides */}
          <fieldset className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400">裁切线</Label>
              <button
                type="button"
                onClick={() => setCuttingGuides(!cuttingGuides)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
                  cuttingGuides
                    ? "border-teal-600 bg-teal-600"
                    : "border-zinc-600 bg-zinc-800"
                }`}
              >
                <span
                  className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
                    cuttingGuides ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-zinc-600">
              <Scissors className="mr-1 inline-block size-3" />
              在照片间显示裁切辅助线
            </p>
          </fieldset>

          <Separator className="bg-zinc-800" />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={!uploadedPhoto || isGenerating}
              className="w-full bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-40"
            >
              {isGenerating ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Grid2x2 className="mr-1.5 size-4" />
              )}
              {isGenerating ? "生成中…" : "生成排版"}
            </Button>

            {layoutResult && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleDownload}
                className="w-full border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
              >
                <Download className="mr-1.5 size-4" />
                下载高清图
              </Button>
            )}
          </div>

          {/* Error hint */}
          {sizesError && (
            <p className="text-center text-xs text-red-400/80">
              无法连接排版引擎，请确认引擎已启动
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

