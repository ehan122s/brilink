## Android Native Setup

Project ini sudah dibungkus dengan Capacitor dan folder native Android sudah dibuat.

### Perintah yang tersedia

- `npm run android`
  Build web terbaru lalu sync ke project Android.

- `npm run cap:open:android`
  Buka project native Android di Android Studio.

### Alur kerja

1. Jalankan `npm run android`
2. Jalankan `npm run cap:open:android`
3. Di Android Studio, tunggu Gradle sync selesai
4. Jalankan ke emulator atau HP Android yang tersambung USB

### Catatan

- Setiap ada perubahan di React/Vite, jalankan lagi `npm run android` sebelum build APK.
- Tampilan mobile sudah dioptimalkan untuk mode potret Android.
- Supabase tetap dipakai dari layer web app di dalam shell Android ini.
