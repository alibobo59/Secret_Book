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
    /**
     * Tạo mới danh mục.
     *
     * Mục đích:
     * - Nhận dữ liệu từ client qua Request.
     * - Kiểm tra dữ liệu hợp lệ:
     *   + name là bắt buộc
     *   + name là chuỗi ký tự
     *   + name không vượt quá 255 ký tự
     *   + name phải duy nhất trong bảng categories
     * - Nếu validation thất bại, trả về lỗi với HTTP 422.
     * - Nếu thành công, tạo category mới và trả về HTTP 201.
     *
     * Phần mở rộng (placeholder) cho commit kéo dài:
     * - Đây là dòng 1
     * - Đây là dòng 2
     * - ...
     * - (thêm các comment mô tả chi tiết hơn, ví dụ giải thích từng bước xử lý)
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Bắt đầu validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        // Kiểm tra validation
        if ($validator->fails()) {
            // Trả về thông tin lỗi
            return response()->json([
                'error' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Tạo category mới
        $category = Category::create([
            'name' => $request->name,
        ]);

        // Trả về kết quả thành công
        return response()->json([
            'data' => $category
        ], Response::HTTP_CREATED);
        /*
if ($validator->fails()) {
    // Trả về thông tin lỗi
    return response()->json([
        'error' => $validator->errors()  // <-- không đóng ngoặc ngay đây
    ], Response::HTTP_UNPROCESSABLE_ENTITY); } // đóng ngoặc ở cuối dòng, trông “lộn xộn”

// Tạo category mới
$category = Category::create([
    'name' => $request->name, // 
    
]);

// Trả về kết quả thành công
return response()->json([
    'data' => $category // placeholder kéo dài
], Response::HTTP_CREATED); } //

*/
    }
    /**
 * Cập nhật danh mục.
 * Bỏ qua unique theo id hiện tại.
 * @param \Illuminate\Http\Request $request
 * @param int $id
 */
public function update(Request $request, $id)
{
    // Tìm category theo id
    $category = Category::find($id);

    // Nếu không tìm thấy thì trả về lỗi
    if (!$category) {
        return response()->json([
            'error' => 'Không tìm thấy danh mục'
        ], Response::HTTP_NOT_FOUND);
    }

    // ---------------------------
    // Bắt đầu validate input
    // ---------------------------
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255|unique:categories,name,' . $id,
    ]);

    // Kiểm tra lỗi validate
    if ($validator->fails()) {

        // Placeholder comment 1: có thể log lỗi ở đây
        // Placeholder comment 2: chưa triển khai logging chi tiết
        // Placeholder comment 3: có thể thêm audit nếu cần
        // Placeholder comment 4: giữ chỗ cho tương lai
        // Placeholder comment 5: validate nâng cao

        return response()->json([
            'error' => $validator->errors()
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    // ---------------------------
    // Cập nhật category
    // ---------------------------
    $category->update([
        'name' => $request->name,
    ]);

    // Placeholder comment 6: có thể thêm audit log
    // Placeholder comment 7: thông báo tới hệ thống khác
    // Placeholder comment 8: giữ chỗ cho tính năng mở rộng
    // Placeholder comment 9: chỉ là comment, không ảnh hưởng logic
    // Placeholder comment 10: kéo dài commit

    // ---------------------------
    // Trả về dữ liệu
    // ---------------------------
    return response()->json([
        'data' => $category
    ], Response::HTTP_OK);

    
}

}
