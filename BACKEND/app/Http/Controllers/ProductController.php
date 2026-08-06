<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Laravel\Facades\Image;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $page     = $request->input('page', 1);
        $per_page = $request->input('per_page', 25);

        $userId   = Auth::user()->id;
        $products = Product::whereHas('bisnis', function ($i) use ($userId) {
            $i->where('user_id', $userId);
        })->paginate($per_page, ['*'], 'page', $page);

        $data = [
            'currentPage' => $products->currentPage(),
            'data'        => $products->map(fn($item) => $this->format($item)),
            'from'        => $products->firstItem(),
            'last_page'   => $products->lastPage(),
            'to'          => $products->lastItem(),
            'total'       => $products->total(),
        ];

        return $this->success('Data produk berhasil diambil', $data);
    }

    public function store(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'bisnis_id'         => 'required|exists:bisnis,id',
            'produk_nama'       => 'required|string',
            'produk_harga'      => 'required|numeric|min:0',
            'net_profit_margin' => 'nullable|numeric|min:0|max:100',
            'produk_image'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors'  => $validate->errors()
            ]);
        }

        $imageUrl = null;
        if ($request->hasFile('produk_image')) {
            $imageUrl = $this->uploadImage($request->file('produk_image'), $request->bisnis_id);
        }

        $product = Product::create([
            ...$request->only(['bisnis_id', 'produk_nama', 'produk_harga', 'net_profit_margin']),
            'produk_image_url' => $imageUrl,
        ]);

        return $this->success('Produk berhasil ditambahkan', ['data' => $this->format($product)], 201);
    }

    public function show(int $id)
    {
        $userId  = Auth::user()->id;
        $product = Product::find($id);

        if (!$product) {
            return $this->error('Produk tidak ditemukan', 404);
        }
        if ($product->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        return $this->success('Data produk berhasil diambil', ['data' => $this->format($product)]);
    }

    public function update(Request $request, int $id)
    {
        $userId  = Auth::user()->id;
        $product = Product::find($id);

        if (!$product) {
            return $this->error('Produk tidak ditemukan', 404);
        }
        if ($product->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $validate = Validator::make($request->all(), [
            'produk_nama'       => 'string',
            'produk_harga'      => 'numeric|min:0',
            'net_profit_margin' => 'nullable|numeric|min:0|max:100',
            'produk_image'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors'  => $validate->errors()
            ]);
        }

        $updateData = $request->only(['produk_nama', 'produk_harga', 'net_profit_margin']);

        if ($request->hasFile('produk_image')) {
            $this->removeImage($product->produk_image_url);
            $updateData['produk_image_url'] = $this->uploadImage(
                $request->file('produk_image'),
                $product->bisnis_id
            );
        }

        $product->update($updateData);

        return $this->success('Produk berhasil diupdate', ['data' => $this->format($product)]);
    }

    public function removeImage(int $id)
    {
        $userId  = Auth::user()->id;
        $product = Product::find($id);

        if (!$product) {
            return $this->error('Produk tidak ditemukan', 404);
        }
        if ($product->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }
        if (!$product->produk_image_url) {
            return $this->error('Produk tidak memiliki gambar', 404);
        }

        $this->removeImage($product->produk_image_url);
        $product->update(['produk_image_url' => null]);

        return $this->success('Gambar produk berhasil dihapus');
    }

    public function destroy(int $id)
    {
        $userId  = Auth::user()->id;
        $product = Product::find($id);

        if (!$product) {
            return $this->error('Produk tidak ditemukan', 404);
        }
        if ($product->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $this->removeImage($product->produk_image_url);
        $product->delete();

        return $this->success('Produk berhasil dihapus');
    }

    // -------------------------
    // Helpers
    // -------------------------

    private function uploadImage($file, int $bisnisId): string
    {
        $image    = Image::read($file)->cover(500, 500)->toWebp(80);
        $filename = "produk/{$bisnisId}/" . uniqid('img_', true) . '.webp';
        Storage::disk('public')->put($filename, $image);

        return Storage::url($filename);
    }

    private function removeImage(?string $imageUrl): void
    {
        if (!$imageUrl) return;
        $path = str_replace('/storage/', '', parse_url($imageUrl, PHP_URL_PATH));
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function format(Product $item): array
    {
        return [
            'id'                => $item->id,
            'bisnis_id'         => $item->bisnis_id,
            'produk_nama'       => $item->produk_nama,
            'produk_harga'      => $item->produk_harga,
            'net_profit_margin' => $item->net_profit_margin,
            'produk_image_url'  => $item->produk_image_url,
            'created_at'        => $item->created_at,
            'updated_at'        => $item->updated_at,
        ];
    }
}
