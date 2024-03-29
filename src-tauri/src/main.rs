#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod get_ridge;
use get_ridge::get_ridge_handler;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_ridge_handler])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
