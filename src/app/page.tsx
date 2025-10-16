"use client";
import { useEffect, useState } from "react";
import { ArrowRightLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  // ------------------------------
  // 🧠 Estados principais
  // ------------------------------
  const [valor, setValor] = useState<string>("");
  const [moedaOrigem, setMoedaOrigem] = useState<string>("BRL");
  const [moedaDestino, setMoedaDestino] = useState<string>("USD");
  const [resultado, setResultado] = useState<number | null>(null);
  const [erro, setErro] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sucesso, setSucesso] = useState<boolean>(false);
  const [historico, setHistorico] = useState<string[]>([]);
  const [moedas, setMoedas] = useState<string[]>([]);

  // ------------------------------
  // 🌍 Buscar lista de moedas disponíveis
  // ------------------------------
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => setMoedas(Object.keys(data.rates)))
      .catch(() => setMoedas(["USD", "BRL", "EUR"]));
  }, []);

  // ------------------------------
  // 💾 Carregar histórico salvo
  // ------------------------------
  useEffect(() => {
    const salvo = localStorage.getItem("historico");
    if (salvo) setHistorico(JSON.parse(salvo));
  }, []);

  // ------------------------------
  // 💾 Salvar histórico no localStorage
  // ------------------------------
  useEffect(() => {
    if (historico.length > 0)
      localStorage.setItem("historico", JSON.stringify(historico.slice(-5)));
  }, [historico]);

  // ------------------------------
  // 🔁 Função principal: converter moeda
  // ------------------------------
  const converter = async () => {
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro("Digite um número válido");
      return;
    }

    setErro("");
    setResultado(null);
    setLoading(true);

    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${moedaOrigem}`);
      if (!res.ok) throw new Error("Não foi possível obter a taxa de câmbio");

      const data = await res.json();
      const taxa = data?.rates?.[moedaDestino];
      if (!taxa) throw new Error("Conversão indisponível");

      const convertido = valorNumerico * taxa;
      setResultado(convertido);
      setSucesso(true);

      // adiciona no histórico
      const novaEntrada = `${valorNumerico} ${moedaOrigem} → ${convertido.toFixed(
        2
      )} ${moedaDestino}`;
      setHistorico((prev) => [...prev.slice(-4), novaEntrada]);

      // esconde mensagem de sucesso depois de 2s
      setTimeout(() => setSucesso(false), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) setErro(err.message);
      else setErro("Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // 🔄 Inverter moedas
  // ------------------------------
  const inverterMoedas = () => {
    const origem = moedaOrigem;
    setMoedaOrigem(moedaDestino);
    setMoedaDestino(origem);
  };

  // ------------------------------
  // 🧱 Interface visual (Tailwind + Motion)
  // ------------------------------
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-sky-600 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 drop-shadow-md">Conversor de Moedas</h1>

      <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-6 w-full max-w-md text-center">
        {/* Campo de valor */}
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Digite um valor"
          className="w-full p-2 rounded-xl text-black mb-4 outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {/* Seleção de moedas */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <select
            value={moedaOrigem}
            onChange={(e) => setMoedaOrigem(e.target.value)}
            className="p-2 rounded-xl text-black flex-1"
          >
            {moedas.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <button
            onClick={inverterMoedas}
            className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-full transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <select
            value={moedaDestino}
            onChange={(e) => setMoedaDestino(e.target.value)}
            className="p-2 rounded-xl text-black flex-1"
          >
            {moedas.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Botão principal */}
        <button
          onClick={converter}
          className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-xl transition-all font-semibold"
        >
          Converter
        </button>

        {/* Mensagens e resultado */}
        {loading && <p className="mt-4 animate-pulse">Carregando...</p>}
        {erro && <p className="mt-4 text-red-300">{erro}</p>}
        {sucesso && <p className="mt-4 text-green-300">✔️ Conversão concluída!</p>}
        {resultado !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 bg-white/20 p-3 rounded-lg"
          >
            <p className="text-lg">
              {valor} {moedaOrigem} ={" "}
              <span className="font-bold text-2xl">{resultado.toFixed(2)}</span>{" "}
              {moedaDestino}
            </p>
          </motion.div>
        )}

        {/* Histórico */}
        {historico.length > 0 && (
          <div className="mt-6 text-left bg-white/10 rounded-xl p-3">
            <h3 className="font-semibold mb-2">Últimas conversões:</h3>
            <ul className="text-sm opacity-90 space-y-1">
              {historico.map((item, index) => (
                <li key={index}>💱 {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="mt-6 opacity-80 text-sm">💹 Taxas em tempo real via open.er-api.com</p>
    </div>
  );
}
