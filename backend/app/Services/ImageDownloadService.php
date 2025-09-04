<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageDownloadService
{
    /**
     * Download an image from URL and store it on the public disk under books/.
     * Returns the relative storage path (e.g., books/abc.jpg) or null on failure.
     */
    public function downloadToPublicBooks(string $url, ?string $suggestedName = null): ?string
    {
        try {
            if (!filter_var($url, FILTER_VALIDATE_URL)) {
                return null;
            }

            $response = Http::timeout(20)->get($url);
            if (!$response->ok()) {
                return null;
            }

            $contentType = strtolower($response->header('Content-Type', ''));
            $ext = $this->extensionFromContentType($contentType) ?? $this->guessExtensionFromUrl($url) ?? 'jpg';

            $base = $suggestedName ? Str::slug($suggestedName) : 'book-image';
            $filename = $base.'-'.Str::random(8).'.'.$ext;
            $path = 'books/'.$filename;

            Storage::disk('public')->put($path, $response->body());

            return $path;
        } catch (\Throwable $e) {
            // swallow and return null; caller can decide fallback
            return null;
        }
    }

    private function extensionFromContentType(?string $contentType): ?string
    {
        return match ($contentType) {
            'image/jpeg', 'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            default => null,
        };
    }

    private function guessExtensionFromUrl(string $url): ?string
    {
        $path = parse_url($url, PHP_URL_PATH) ?? '';
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (in_array($ext, ['jpg','jpeg','png','webp','gif'])) {
            return $ext === 'jpeg' ? 'jpg' : $ext;
        }
        return null;
    }
}