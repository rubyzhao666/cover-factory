'use client'

import { useCallback, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import type { UploadedImage } from '@/lib/types'

interface ImageUploaderProps {
  images: UploadedImage[]
  onUpload: (images: UploadedImage[]) => void
  onRemove: (id: string) => void
  maxCount?: number
  label: string
  description?: string
  required?: boolean
}

export function ImageUploader({
  images,
  onUpload,
  onRemove,
  maxCount = 5,
  label,
  description,
  required = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const remaining = maxCount - images.length
      if (remaining <= 0) return

      const newFiles = fileArray.slice(0, remaining).map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
      }))

      onUpload([...images, ...newFiles])
    },
    [images, maxCount, onUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {maxCount > 1 && (
          <span className="text-xs text-gray-400">
            ({images.length}/{maxCount})
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}

      {/* 拖拽上传区 */}
      {images.length < maxCount && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.multiple = maxCount > 1
            input.onchange = (e) => {
              if (e.target instanceof HTMLInputElement && e.target.files) {
                handleFiles(e.target.files)
              }
            }
            input.click()
          }}
          className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all ${
            isDragging
              ? 'border-orange-400 bg-orange-50'
              : 'border-gray-200 bg-gray-50/50 hover:border-orange-300 hover:bg-orange-50/50'
          }`}
        >
          <div className={`rounded-full p-2 ${isDragging ? 'bg-orange-100' : 'bg-gray-100'}`}>
            <Upload className={`h-5 w-5 ${isDragging ? 'text-orange-500' : 'text-gray-400'}`} />
          </div>
          <p className="text-sm text-gray-500">点击或拖拽上传图片</p>
          <p className="text-xs text-gray-400">支持 JPG、PNG、WebP</p>
        </div>
      )}

      {/* 已上传的图片预览 */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.preview}
                alt="上传的图片"
                className="h-full w-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(img.id)
                  URL.revokeObjectURL(img.preview)
                }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <ImageIcon className="h-3 w-3" />
          <span>支持多张上传</span>
        </div>
      )}
    </div>
  )
}
