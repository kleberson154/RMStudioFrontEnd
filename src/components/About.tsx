export default function About() {
  return (
    <div id="About" className="flex flex-col-reverse xl:flex-row text-black">
      <div className="px-5 xl:pl-48 pt-10 xl:py-8 w-full xl:w-1/2">
        <h2 className="uppercase  text-xl font-bold">Sobre a</h2>
        <h1 className="uppercase text-ametista text-3xl font-bold">
          RM Studio
        </h1>
        <p className="pt-5">
          No RM Studio, unimos técnica, atendimento humanizado e paixão pela
          beleza para oferecer uma experiência completa. Nosso objetivo é cuidar
          da sua imagem com serviços personalizados, respeitando seu estilo e
          realçando o melhor de você em cada atendimento.
        </p>
        <div className="pt-5 flex flex-col sm:grid sm:grid-cols-2 gap-5">
          <span className="flex items-start gap-5 sm:w-64 xl:w-full">
            <img
              src="/public/tesoura.svg"
              alt="pente e tesoura"
              className="pt-2"
            />
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold">Equipamentos</h3>
              <p className="">
                Utilizamos equipamentos de alta qualidade para garantir o melhor
                serviço
              </p>
            </div>
          </span>
          <span className="flex items-start gap-5 sm:w-64 xl:w-full">
            <img src="/public/produtos.svg" alt="produtos" className="pt-2" />
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold">Hidratação</h3>
              <p className="">
                Tratamentos de hidratação para todos os tipos de cabelo
              </p>
            </div>
          </span>
          <span className="flex items-start gap-5 sm:w-64 xl:w-full">
            <img
              src="/public/corte.svg"
              alt="corte de cabelo"
              className="pt-2"
            />
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold">Corte</h3>
              <p className="">Corte de cabelo masculino e feminino</p>
            </div>
          </span>
          <span className="flex items-start gap-5 sm:w-64 xl:w-full">
            <img
              src="/public/limpeza.svg"
              alt="pente e tesoura"
              className="pt-2"
            />
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold">Limpeza</h3>
              <p className="">Serviços de limpeza de cabelo, pele e unhas</p>
            </div>
          </span>
        </div>
      </div>
      <div className="bg-[url('/public/salon1.svg')] bg-cover bg-top w-full xl:w-1/2"></div>
    </div>
  )
}
