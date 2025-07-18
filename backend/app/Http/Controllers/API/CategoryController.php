<?php
/**
 * ----------------------------------------------------------------------------- 
 * CategoryController — SKELETON (Commit 4a)
 * ----------------------------------------------------------------------------- 
 *
 * Mục tiêu:
 *  - Tạo khung controller cho API danh mục.
 *  - Chưa thêm bất kỳ hành vi (method) nào ở commit này.
 *  - Lịch sử commit sẽ rõ ràng khi từng method được bổ sung.
 *
 * Ghi chú:
 *  - Các method CRUD sẽ được thêm lần lượt ở commit tiếp theo.
 *  - Bao gồm index(), show(), store(), update(), destroy().
 *  - Mỗi method sẽ có validate dữ liệu, xử lý lỗi và trả về JsonResponse.
 *  - Đây là skeleton nên không có logic thực thi nào tại thời điểm này.
 *
 * TODO:
 *  - Thêm property protected/public nếu cần.
 *  - Thêm các trait, helper, middleware khi cần.
 *  - Đặt các constant hoặc config key nếu dùng chung cho category.
 *  - Bổ sung các event, observer hoặc log khi cập nhật category.
 *
 * Note:
 *  - Import các class dưới đây để chuẩn bị cho các commit tiếp theo.
 *  - Không dùng ngay trong commit này để tránh lỗi ứng dụng.
 */

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;                           // dùng ở commit sau
use Illuminate\Http\Request;                       // dùng ở commit sau
use Illuminate\Support\Facades\Validator;          // dùng ở commit sau
use Symfony\Component\HttpFoundation\Response;     // dùng ở commit sau

class CategoryController extends Controller
{
    // =====================================================================================
    // TODO: Các phương thức sẽ được bổ sung ở commit tiếp theo:
    //   - index(): lấy danh sách category
    //   - show($id): xem chi tiết category
    //   - store(Request $request): tạo mới category
    //   - update(Request $request, $id): cập nhật category
    //   - destroy($id): xóa category
    // =====================================================================================

    // Placeholder properties (nếu cần)
    // protected $exampleProperty;
    // public $anotherExample;

    // Placeholder constants (nếu cần)
    // const CATEGORY_TYPE_DEFAULT = 'default';

    // TODO: có thể thêm middleware, helper hoặc traits ở commit sau
    /**
 * Lấy danh sách tất cả các danh mục.
 *
 * Mỗi category được sắp xếp theo tên (ascending).
 * Response trả về dưới dạng JSON với HTTP code 200.
 *
 * Có thể mở rộng:
 *  - Thêm phân trang
 *  - Thêm filter theo tên, trạng thái
 *  - Thêm cache để tăng hiệu suất
 *
 * @return \Illuminate\Http\JsonResponse
 */
public function index()
{
    // Lấy tất cả các category từ database
    $categories = Category::orderBy('name', 'asc')->get();

    // TODO: có thể thêm transform data hoặc resource
    $dataToReturn = [
        'total' => count($categories),
        'categories' => $categories,
        'timestamp' => now(), // thêm timestamp cho debug
    ];

    return response()->json(['data' => $dataToReturn], Response::HTTP_OK);
}

/**
 * Xem chi tiết một danh mục theo ID.
 *
 * Response:
 *  - 200: nếu tìm thấy
 *  - 404: nếu không tìm thấy
 *
 * TODO:
 *  - Thêm cache cho category
 *  - Thêm log khi category không tồn tại
 *
 * @param int $id
 * @return \Illuminate\Http\JsonResponse
 */
public function show($id)
{
    // Tìm category theo ID
    $category = Category::find($id);

    // Nếu không tìm thấy, trả về 404 với message
    if (!$category) {
        return response()->json([
            'error' => 'Không tìm thấy danh mục',
            'requested_id' => $id,
            'timestamp' => now(),
        ], Response::HTTP_NOT_FOUND);
    }

    // Trả về category dưới dạng JSON
    $dataToReturn = [
        'id' => $category->id,
        'name' => $category->name,
        'created_at' => $category->created_at,
        'updated_at' => $category->updated_at,
        // TODO: có thể thêm số lượng sách trong category
    ];

    return response()->json(['data' => $dataToReturn], Response::HTTP_OK);
}

}
