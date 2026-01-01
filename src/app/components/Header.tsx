export default function Header () {
    return (
        <div className="flex justify-center gap-10 py-6">
            <div><a href="/">Home</a></div>
            <div className="flex direction-row gap-4">
                <div><a href="/about">About</a></div>
                <div><a href="/contact">Contact</a></div>
            </div>
        </div>
    )
}