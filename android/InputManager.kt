package com.dex.desktop.input

import android.view.MotionEvent
import android.view.View

/**
 * Maps USB events to Android UI events.
 */
class InputManager(private val desktopView: View) {
    private var virtualCursorX = 0f
    private var virtualCursorY = 0f

    fun handleUSBPacket(type: String, x: Float, y: Float, action: Int) {
        when (type) {
            "MOVE" -> updateCursor(x, y)
            "CLICK" -> injectTouch(action)
            "SCROLL" -> injectScroll(y)
        }
    }

    private fun updateCursor(x: Float, y: Float) {
        virtualCursorX = x
        virtualCursorY = y
        // Update cursor overlay position
        desktopView.post {
            // desktopView.findViewById<View>(R.id.cursor).translationX = x
            // desktopView.findViewById<View>(R.id.cursor).translationY = y
        }
    }

    private fun injectTouch(action: Int) {
        val event = MotionEvent.obtain(
            System.currentTimeMillis(),
            System.currentTimeMillis(),
            action, // MotionEvent.ACTION_DOWN, ACTION_UP, etc.
            virtualCursorX,
            virtualCursorY,
            0
        )
        desktopView.dispatchTouchEvent(event)
        event.recycle()
    }

    private fun injectScroll(delta: Float) {
        val event = MotionEvent.obtain(
            System.currentTimeMillis(),
            System.currentTimeMillis(),
            MotionEvent.ACTION_SCROLL,
            virtualCursorX,
            virtualCursorY,
            0
        )
        // Add axis value for vertical scroll
        // event.setAxisValue(MotionEvent.AXIS_VSCROLL, delta)
        desktopView.dispatchGenericMotionEvent(event)
        event.recycle()
    }
}
