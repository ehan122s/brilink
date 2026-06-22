import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const BrilinkFlowApp());
}

class BrilinkFlowApp extends StatelessWidget {
  const BrilinkFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'BRILink Flow',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0A2E73),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFEFF4FF),
        useMaterial3: true,
      ),
      home: const BrilinkWebShell(),
    );
  }
}

class BrilinkWebShell extends StatefulWidget {
  const BrilinkWebShell({super.key});

  @override
  State<BrilinkWebShell> createState() => _BrilinkWebShellState();
}

class _BrilinkWebShellState extends State<BrilinkWebShell> {
  late final WebViewController _controller;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) {
              setState(() {
                _isLoading = true;
                _errorMessage = null;
              });
            }
          },
          onPageFinished: (_) {
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
          },
          onWebResourceError: (error) {
            if (mounted) {
              setState(() {
                _isLoading = false;
                _errorMessage =
                    'Gagal memuat aplikasi. Pastikan asset web sudah disinkronkan.';
              });
            }
          },
        ),
      );

    _loadLocalApp();
  }

  Future<void> _loadLocalApp() async {
    try {
      await _controller.loadFlutterAsset('assets/web/index.html');
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage =
              'Asset web belum tersedia. Jalankan npm run flutter:prepare lebih dulu.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          SafeArea(
            child: WebViewWidget(controller: _controller),
          ),
          if (_isLoading)
            const Positioned.fill(
              child: ColoredBox(
                color: Color(0xFFEFF4FF),
                child: _LoadingView(),
              ),
            ),
          if (_errorMessage != null)
            Positioned.fill(
              child: ColoredBox(
                color: const Color(0xFFEFF4FF),
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.phone_android_rounded,
                          size: 58,
                          color: Color(0xFF0A2E73),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'BRILink Flow',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0A2E73),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          _errorMessage!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 15,
                            color: Color(0xFF607095),
                            height: 1.45,
                          ),
                        ),
                        const SizedBox(height: 18),
                        FilledButton(
                          onPressed: _loadLocalApp,
                          style: FilledButton.styleFrom(
                            backgroundColor: const Color(0xFF1F6FEB),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 22,
                              vertical: 14,
                            ),
                          ),
                          child: const Text('Coba Lagi'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _LoadingView extends StatelessWidget {
  const _LoadingView();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: const [
          Icon(
            Icons.account_balance_wallet_rounded,
            size: 56,
            color: Color(0xFF0A2E73),
          ),
          SizedBox(height: 18),
          CircularProgressIndicator(
            color: Color(0xFF1F6FEB),
            strokeWidth: 3,
          ),
          SizedBox(height: 18),
          Text(
            'Membuka BRILink Flow...',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF0A2E73),
            ),
          ),
        ],
      ),
    );
  }
}
