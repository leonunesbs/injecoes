// src/app/login/page.tsx

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineLoading3Quarters, AiOutlineLock } from 'react-icons/ai';
import { z } from 'zod';

// Schema de validação com Zod
const schema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').nonempty('A senha é obrigatória'),
});

// Tipagem baseada no schema de validação
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false); // Estado para feedback de sucesso
  const [loginError, setLoginError] = useState(false); // Estado para feedback de erro

  // Configuração do react-hook-form com o schema do Zod
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Função de envio do formulário
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setLoginError(false); // Resetando erro ao tentar novamente

    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ password: data.password }),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    setLoading(false);

    if (response.ok) {
      setLoginSuccess(true); // Exibir feedback de sucesso
      setTimeout(() => router.push('/'), 2000); // Redireciona após 2 segundos
    } else {
      setLoginError(true); // Exibir feedback de erro
      setError('password', { message: 'Senha incorreta. Tente novamente.' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-lg border dark:border-none shadow text-center">
        <div className="avatar mb-8">
          <div className="rounded-full border">
            <Image alt="AntiVEGF Logo" src={'/logo.jpg'} width={100} height={100} priority quality={80} />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-center text-primary mb-6">Acesso Protegido</h1>
        <p className="text-center text-gray-500 mb-6">Insira a senha para continuar</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control">
            <label className="input input-bordered flex items-center gap-2">
              <AiOutlineLock className="text-gray-400" size={20} />
              <input
                id="password"
                type="password"
                placeholder="Digite a senha"
                className="grow"
                {...register('password')}
              />
            </label>
            {errors.password && (
              <span className="text-error flex items-center gap-1 text-sm mt-1">
                <AiOutlineCloseCircle />
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Mensagem de sucesso ou erro */}
          {loginError && (
            <div className="alert alert-error flex items-center gap-2 mt-2">
              <AiOutlineCloseCircle className="text-lg" />
              <span>Senha incorreta. Tente novamente.</span>
            </div>
          )}
          {loginSuccess && (
            <div className="alert alert-success flex items-center gap-2 mt-2">
              <AiOutlineCheckCircle className="text-lg" />
              <span>Login bem-sucedido! Redirecionando...</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || loginSuccess}
            className={`btn btn-primary w-full mt-4 ${
              loading ? 'btn-disabled' : ''
            } flex items-center justify-center gap-2`}
          >
            {loading && <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
