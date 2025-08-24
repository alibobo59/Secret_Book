<?php
// app/Http/Controllers/API/AiChatController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AiChatController extends Controller
{
    // GET /api/chat/authors?q=anh
    public function searchAuthors(Request $req)
    {
        $q = trim($req->query('q',''));
        $authors = Author::query()
            ->when($q !== '', fn($qr) =>
                $qr->where('name','like', "%$q%")
            )
            ->select('id','name','slug')
            ->orderBy('name')
            ->limit(20)
            ->get();
        return response()->json(['data'=>$authors]);
    }

    // GET /api/chat/authors/{id}/books
    public function booksByAuthor($id)
    {
        $books = Book::with(['author:id,name','categories:id,name'])
            ->where('author_id',$id)
            ->select('id','title','price','image') // image_url sẽ tự append
            ->orderBy('title')
            ->limit(20)
            ->get()
            ->append('image_url');
        return response()->json(['data'=>$books]);
    }

    // GET /api/chat/genres?q=trinh
    public function searchGenres(Request $req)
    {
        $q = trim($req->query('q',''));
        $genres = Category::query()
            ->when($q !== '', fn($qr)=>
                $qr->where('name','like',"%$q%")
            )
            ->select('id','name','slug')
            ->orderBy('name')
            ->limit(20)
            ->get();
        return response()->json(['data'=>$genres]);
    }

    // GET /api/chat/genres/{id}/books
    public function booksByGenre($id)
    {
        $books = Book::with(['author:id,name'])
            ->whereHas('categories', fn($qr)=>$qr->where('categories.id',$id))
            ->select('id','title','price','image','author_id')
            ->limit(24)
            ->get()
            ->append('image_url');
        return response()->json(['data'=>$books]);
    }

    // GET /api/chat/trending?limit=3
    public function trendingBooks(Request $req)
    {
        $limit = max(1, min((int)$req->query('limit',3), 10));

        $rows = OrderItem::query()
            ->select([
                'book_id',
                DB::raw('SUM(quantity) as sold'),
                DB::raw('SUM(quantity * price) as revenue'),
            ])
            ->groupBy('book_id')
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get();

        $bookIds = $rows->pluck('book_id')->all();
        $books = Book::with('author:id,name')
            ->whereIn('id',$bookIds)
            ->get()
            ->keyBy('id')
            ->append('image_url');

        $data = $rows->map(fn($r)=>[
            'book'    => $books[$r->book_id] ?? null,
            'sold'    => (int)$r->sold,
            'revenue' => (int)$r->revenue,
        ])->filter(fn($x)=>$x['book']);

        return response()->json(['data'=>$data->values()]);
    }
}
