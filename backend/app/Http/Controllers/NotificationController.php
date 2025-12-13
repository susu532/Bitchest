<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Notification::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc');

        // Filter by type if provided
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter by read status if provided
        if ($request->has('is_read')) {
            $isRead = filter_var($request->is_read, FILTER_VALIDATE_BOOLEAN);
            if ($isRead) {
                $query->read();
            } else {
                $query->unread();
            }
        }

        $notifications = $query->paginate(50);

        return response()->json($notifications);
    }

    /**
     * Create a new notification.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:success,error,info,warning',
            'message' => 'required|string|max:255',
            'details' => 'nullable|string',
        ]);

        $notification = Notification::create([
            'user_id' => $request->user()->id,
            'type' => $validated['type'],
            'message' => $validated['message'],
            'details' => $validated['details'] ?? null,
            'is_read' => false,
        ]);

        return response()->json($notification, 201);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->update(['is_read' => true]);

        return response()->json($notification);
    }

    /**
     * Delete a specific notification.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->delete();

        return response()->json(['message' => 'Notification deleted successfully']);
    }

    /**
     * Delete all read notifications for the authenticated user.
     */
    public function deleteRead(Request $request): JsonResponse
    {
        $deletedCount = Notification::where('user_id', $request->user()->id)
            ->where('is_read', true)
            ->delete();

        return response()->json([
            'message' => 'Read notifications deleted successfully',
            'deleted_count' => $deletedCount
        ]);
    }
}
