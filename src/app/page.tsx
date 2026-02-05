import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Tracker - Home",
  description: "Track and manage your sports activities and matches",
};

export default function Home() {
  return (
    <div>
      <main>
        <div>Sports Tracker App</div>
        <div>
          Landing Page OR...
        </div>
        <div>
          Personal Feed
        </div>
      </main>
    </div>
  );
}
