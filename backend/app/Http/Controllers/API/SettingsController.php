<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    /**
     * Get all settings
     */
    public function index()
    {
        try {
            // Get settings from cache or default values
            $settings = Cache::get('admin_settings', $this->getDefaultSettings());
            
            return response()->json($settings);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể tải cài đặt',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update settings
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'shipping.freeShippingThreshold' => 'sometimes|numeric|min:0',
                'shipping.standardShippingCost' => 'sometimes|numeric|min:0',
                'shipping.expressShippingCost' => 'sometimes|numeric|min:0',
                'shipping.estimatedDeliveryDays' => 'sometimes|integer|min:1',
                'shipping.expressDeliveryDays' => 'sometimes|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get current settings
            $currentSettings = Cache::get('admin_settings', $this->getDefaultSettings());
            
            // Update only the provided settings
            if ($request->has('shipping')) {
                $currentSettings['shipping'] = array_merge(
                    $currentSettings['shipping'],
                    $request->input('shipping')
                );
            }
            
            if ($request->has('general')) {
                $currentSettings['general'] = array_merge(
                    $currentSettings['general'],
                    $request->input('general')
                );
            }
            
            if ($request->has('email')) {
                $currentSettings['email'] = array_merge(
                    $currentSettings['email'],
                    $request->input('email')
                );
            }
            
            if ($request->has('payment')) {
                $currentSettings['payment'] = array_merge(
                    $currentSettings['payment'],
                    $request->input('payment')
                );
            }
            
            if ($request->has('orders')) {
                $currentSettings['orders'] = array_merge(
                    $currentSettings['orders'],
                    $request->input('orders')
                );
            }
            
            if ($request->has('notifications')) {
                $currentSettings['notifications'] = array_merge(
                    $currentSettings['notifications'],
                    $request->input('notifications')
                );
            }
            
            if ($request->has('system')) {
                $currentSettings['system'] = array_merge(
                    $currentSettings['system'],
                    $request->input('system')
                );
            }

            // Save to cache and file
            Cache::put('admin_settings', $currentSettings, now()->addDays(30));
            
            // Also save to file for persistence
            Storage::disk('local')->put('admin_settings.json', json_encode($currentSettings, JSON_PRETTY_PRINT));

            return response()->json([
                'message' => 'Cài đặt đã được lưu thành công',
                'settings' => $currentSettings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể lưu cài đặt',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get shipping settings specifically
     */
    public function getShippingSettings()
    {
        try {
            $settings = Cache::get('admin_settings', $this->getDefaultSettings());
            return response()->json($settings['shipping']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể tải cài đặt vận chuyển',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get default settings
     */
    private function getDefaultSettings()
    {
        // Try to load from file first
        if (Storage::disk('local')->exists('admin_settings.json')) {
            $fileContent = Storage::disk('local')->get('admin_settings.json');
            $settings = json_decode($fileContent, true);
            if ($settings) {
                return $settings;
            }
        }

        // Return default settings if file doesn't exist or is invalid
        return [
            'general' => [
                'siteName' => 'BookStore Admin',
                'contactEmail' => 'admin@bookstore.com',
                'siteDescription' => 'Your premier online bookstore',
                'contactPhone' => '+1 (555) 123-4567',
                'timezone' => 'UTC',
                'businessAddress' => '123 Main St, City, State 12345'
            ],
            'email' => [
                'smtpHost' => 'smtp.gmail.com',
                'smtpPort' => 587,
                'smtpUsername' => '',
                'smtpPassword' => '',
                'fromName' => 'BookStore',
                'fromEmail' => 'noreply@bookstore.com',
                'enableSSL' => true,
                'testMode' => false
            ],
            'payment' => [
                'enableCOD' => true,
                'enableStripe' => false,
                'enablePaypal' => false,
                'taxRate' => 8.5,
                'processingFee' => 2.5
            ],
            'orders' => [
                'autoConfirmOrders' => true,
                'autoReserveStock' => true,
                'allowBackorders' => false,
                'autoCancelUnpaid' => true,
                'reservationDuration' => 24,
                'unpaidCancelDuration' => 72,
                'orderNumberPrefix' => 'ORD',
                'minOrderValue' => 10.00
            ],
            'shipping' => [
                'freeShippingThreshold' => 500000,
                'standardShippingCost' => 30000,
                'expressShippingCost' => 50000,
                'estimatedDeliveryDays' => 5,
                'expressDeliveryDays' => 2
            ],
            'notifications' => [
                'orderConfirmation' => true,
                'orderShipped' => true,
                'orderDelivered' => true,
                'newOrderAlert' => true,
                'lowStockAlert' => true,
                'lowStockThreshold' => 10,
                'dailyReports' => false,
                'weeklyReports' => true,
                'monthlyReports' => true
            ],
            'system' => [
                'maintenanceMode' => false,
                'debugMode' => false,
                'cacheEnabled' => true,
                'allowRegistration' => true,
                'requireEmailVerification' => true,
                'sessionTimeout' => 30,
                'maxFileUploadSize' => 10,
                'logRetentionDays' => 30,
                'backupFrequency' => 'weekly',
                'autoBackup' => true
            ]
        ];
    }
}