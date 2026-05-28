use include_dir::{include_dir, Dir};
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;

// Embedded storage for alternative and base icons
pub static ALT_ICONS: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/../public/alt-icons");
pub static BASE_ICONS: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/icons");

#[cfg(target_os = "windows")]
#[link(name = "shell32")]
extern "system" {
    fn SetCurrentProcessExplicitAppUserModelID(AppID: *const u16) -> i32;
}

/// Sets the explicit AppUserModelID for the current process on Windows.
/// This prevents Windows from grouping this process with the standard shortcut,
/// which would override dynamic taskbar icon changes.
pub fn set_explicit_app_user_model_id(app_id: &str) -> i32 {
    #[cfg(target_os = "windows")]
    {
        let wide_id: Vec<u16> = OsStr::new(app_id)
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();
        unsafe { SetCurrentProcessExplicitAppUserModelID(wide_id.as_ptr()) }
    }
    #[cfg(not(target_os = "windows"))]
    {
        -999
    }
}

/// Decodes `.ico` format bytes from memory and scales them to a standard 256x256 image buffer.
pub fn decode_ico_to_image(bytes: &[u8]) -> Result<tauri::image::Image<'static>, String> {
    let img = image::load_from_memory_with_format(bytes, image::ImageFormat::Ico)
        .map_err(|e| format!("Icon load/decode error from memory using Ico format: {}", e))?;
    
    // Scale to 256x256 so Windows high-DPI shell doesn't discard it
    let scaled = img.resize(256, 256, image::imageops::FilterType::Lanczos3);
    let rgba = scaled.to_rgba8();
    let (width, height) = rgba.dimensions();
    
    Ok(tauri::image::Image::new_owned(rgba.into_raw(), width, height))
}
