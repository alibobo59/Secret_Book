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
}
