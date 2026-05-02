"use client";

import BarberCard from "@/components/barbers/BarberCard";
import GenericList from "@/components/GenericList";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

type Barber = {
  id: string;
  name: string;
  specialty?: string;
  icone?: string;
};

export default function Barber() {
  const [search, setSearch] = React.useState("");
  const [barbers, setBarbers] = React.useState<Barber[]>([]);
  const router = useRouter();

  useEffect(() => {
    apiClient("/user/barbers").then((data) => setBarbers(data as Barber[]));
  }, []);

  function handleNovo() {
    router.push("/barbers/register");
  }

  const filtered = barbers.filter((barber) =>
    barber.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <GenericList
      title="Barbeiros"
      total={barbers.length}
      buttonLabel="Adicionar Barbeiro"
      onClick={handleNovo}
      onSearch={setSearch}
    >
      {filtered.map((barber) => (
        <BarberCard key={barber.id} barber={barber} />
      ))}
    </GenericList>
  );
}
