package com.dex.desktop.usb

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.hardware.usb.UsbAccessory
import android.hardware.usb.UsbManager
import android.os.ParcelFileDescriptor
import java.io.FileInputStream
import java.io.FileOutputStream
import java.nio.ByteBuffer

/**
 * Handles USB Accessory Mode (AOA) communication.
 */
class USBController(private val context: Context, private val listener: USBInputListener) {
    private val usbManager = context.getSystemService(Context.USB_SERVICE) as UsbManager
    private var fileDescriptor: ParcelFileDescriptor? = null
    private var inputStream: FileInputStream? = null
    private var outputStream: FileOutputStream? = null

    interface USBInputListener {
        fun onPacketReceived(packet: USBPacket)
    }

    data class USBPacket(
        val type: String,
        val x: Float,
        val y: Float,
        val action: Int,
        val timestamp: Long
    )

    fun openAccessory(accessory: UsbAccessory) {
        fileDescriptor = usbManager.openAccessory(accessory)
        fileDescriptor?.let {
            val fd = it.fileDescriptor
            inputStream = FileInputStream(fd)
            outputStream = FileOutputStream(fd)
            
            startReading()
        }
    }

    private fun startReading() {
        Thread {
            val buffer = ByteArray(1024)
            while (true) {
                val bytesRead = inputStream?.read(buffer) ?: -1
                if (bytesRead > 0) {
                    val packet = parsePacket(buffer, bytesRead)
                    listener.onPacketReceived(packet)
                }
            }
        }.start()
    }

    private fun parsePacket(data: ByteArray, length: Int): USBPacket {
        // HID over AOA protocol parsing
        // Byte 0: Packet Type (0x01: MOVE, 0x02: CLICK, 0x03: SCROLL)
        val type = when (data[0].toInt()) {
            0x01 -> "MOVE"
            0x02 -> "CLICK"
            0x03 -> "SCROLL"
            else -> "UNKNOWN"
        }

        val buffer = ByteBuffer.wrap(data)
        buffer.position(1)
        
        val x = if (length >= 5) buffer.float else 0f
        val y = if (length >= 9) buffer.float else 0f
        val action = if (length >= 10) data[9].toInt() else 0
        val timestamp = if (length >= 18) buffer.getLong(10) else System.currentTimeMillis()

        return USBPacket(type, x, y, action, timestamp)
    }
}
