"use client";
import BarberCard from "@/components/barbers/BarberCard";
import GenericList from "@/components/GenericList";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";



export default function Barber() {
    const [search, setSearch] = React.useState("");
    const router = useRouter()

    useEffect(() => {
        apiClient("/user/barbers")
            .then((data) => setBarbers(data));
    }, []);

    const [barbers, setBarbers] = React.useState<any[]>([]);

    function handleNovo() {
        router.push("/barbers/register");
    }       
    const filtered = barbers.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
        
  return (
    <GenericList
      title="Barbeiros"
      total={barbers.length}
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