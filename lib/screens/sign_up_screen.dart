import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../state/app_state.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _submit() async {
    setState(() { _loading = true; _error = null; });
    final ok = await context.read<AppState>().createAccount(
      _name.text.trim(), _email.text.trim(), _password.text);
    setState(() { _loading = false; });
    if (ok && mounted) {
      Navigator.of(context).pushReplacementNamed('/discover');
    } else {
      setState(() { _error = 'Account already exists'; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Create Account', style: TextStyle(color: AppColors.gold, fontSize: 32, fontWeight: FontWeight.w900)),
                const SizedBox(height: 24),
                TextField(
                  controller: _name,
                  style: const TextStyle(color: AppColors.navy),
                  decoration: const InputDecoration(labelText: 'Name'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _email,
                  style: const TextStyle(color: AppColors.navy),
                  decoration: const InputDecoration(labelText: 'Email'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _password,
                  obscureText: true,
                  style: const TextStyle(color: AppColors.navy),
                  decoration: const InputDecoration(labelText: 'Password'),
                ),
                const SizedBox(height: 16),
                if (_error != null) Text(_error!, style: const TextStyle(color: Colors.redAccent)),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    child: Text(_loading ? 'Creating...' : 'Create Account'),
                  ),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () => Navigator.pushReplacementNamed(context, '/signin'),
                  child: const Text('Already have an account? Sign In'),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
