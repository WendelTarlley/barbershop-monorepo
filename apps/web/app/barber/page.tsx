"use client";
import BarberCard from "@/components/barber/BarberCard";
import GenericList from "@/components/GenericList";
import { useRouter } from "next/navigation";
import React from "react";


const barbeiros = [
    {
        id: "1",
        titulo: "João Silva",
        subtitulo: "45 min • R$ 65,00",
        icone: "👨",
        href: "/barbeiros/1"
    },
    {
        id: "2",
        titulo: "Maria Santos",
        subtitulo: "Cabelos Crespos",
        icone: "👩",
        href: "/barbeiros/2"
    },
    {
        id: "3",
        titulo: "Carlos Oliveira",
        subtitulo: "60 min • R$ 80,00",
        icone: "👨",
        href: "/barbeiros/3"
    }
];

export default function Barber() {
    const [search, setSearch] = React.useState("");
    const router = useRouter()


    function handleNovo() {
        router.push("/barber/register");
    }       
    const filtered = barbeiros.filter(b => b.titulo.toLowerCase().includes(search.toLowerCase()));
        
  return (
    <GenericList
      title="Barbeiros"
      total={barbeiros.length}
      buttonLabel="Adicionar Barbeiro"
      onClick={handleNovo}
      onSearch={setSearch}
    >
      {filtered.map((barbeiro) => (
        <BarberCard key={barbeiro.id} barbeiro={barbeiro} />
      ))}
    </GenericList>

  );
}