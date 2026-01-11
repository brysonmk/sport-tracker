export default function Header () {
    return (
        <div className="flex justify-center gap-20 py-6">
            <div><a href="/">Home</a></div>
            <div className="flex direction-row gap-6">
                <div><a href="/matches-table">Matches Table</a></div>
                <div><a href="/about">About</a></div>
                <div><a href="/contact">Contact</a></div>
            </div>
            <div><a href="/login">Login</a></div>
        </div>
    )
}