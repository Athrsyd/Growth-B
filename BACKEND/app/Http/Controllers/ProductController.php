<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index(Request $request)
    {

        $page = $request->input('page', 1);
        $per_page = $request->input('per_page', 25);

        $userId = Auth::user()->id;
        $products = Product::whereHas('bisnis', function ($i) use ($userId) {
            $i->where('user_id', $userId);
        })->paginate($per_page, ['*'], 'page', $page);

        $data = [
            'currentPage' => $products->currentPage(),
            'data' => $products->map(fn($item) => [
                'id' => $item->id,
                'bisnis_id' => $item->bisnis_id,
                'product_nama' => $item->product_nama,
                'product_harga' => $item->product_harga,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ]),
            'from' => $products->firstItem(),
            'last_page' => $products->lastPage(),
            'to' => $products->lastItem(),
            'total' => $products->total(),
        ];

        return $this->success('Data produk berhasil diambil', $data);
    }
    public function store(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'bisnis_id' => 'required|exists:bisnis,id',
            'produk_nama' => 'required|string',
            'produk_harga' => 'required|numeric|min:0',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ]);
        }

        $product = Product::create($request->all());

        return $this->success('Produk berhasil ditambahkan', ['data' => $product]);
    }
    public function update(Request $request, int $id)
    {
        $userId = Auth::user()->id;
        $product = Product::find($id);
        if (!$product) {
            return $this->error('Produk tidak ditemukan', 404);
        }
        if ($product->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $validate = Validator::make($request->all(), [
            'produk_nama' => 'string',
            'produk_harga' => 'numeric|min:0',
        ]);
        if ($validate->fails()) {
            return response()->json([
                'message' => 'invalid field',
                'errors' => $validate->errors()
            ]);
        }

        $product->update($request->all());
        return $this->success('Produk berhasil diupdate', ['data' => $product]);
    }
    public function show(int $id)
    {
        $userId = Auth::user()->id;
        $product = Product::find($id);
        if (!$product) {
            return $this->error('Produk tidak ditemukan', 404);
        }
        if ($product->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        return $this->success('Data produk berhasil diambil', ['data' => $product]);
    }
    public function destroy(int $id)
    {
        $userId = Auth::user()->id;
        $product = Product::find($id);
        if (!$product) {
            return $this->error('Produk tidak ditemukan', 404);
        }
        if ($product->bisnis->user_id !== $userId) {
            return $this->error('Akses Dilarang', 403);
        }

        $product->delete();
        return $this->success('Produk berhasil dihapus');
    }
}
