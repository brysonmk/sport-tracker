import Link from "next/link";

export default function Header () {
    return (
        <div className="flex justify-center gap-20 py-6">
            <div><Link href="/">Home</Link></div>
            <div className="flex direction-row gap-6">
                <div><Link href="/matches-table">Matches Table</Link></div>
                <div><Link href="/about">About</Link></div>
                <div><Link href="/contact">Contact</Link></div>
            </div>
            <div><Link href="/login">Login</Link></div>
        </div>
    )
}
