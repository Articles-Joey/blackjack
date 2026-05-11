import LobbyPage from "."

export const metadata = {
    title: process.env.NEXT_PUBLIC_GAME_NAME,
}

export default function Home() {

  return (
    <LobbyPage />
  )

}
