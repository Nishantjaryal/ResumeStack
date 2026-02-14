
interface NavbarProps {
    user: {
        name:string,
        imgUrl:string
    }
  }

export function Navbar({user}: NavbarProps) {
    return <nav className="w-full h-16 bg-primary text-primary-foreground flex items-center justify-between px-4">
        <h1 className="text-lg font-bold">ResumeStack</h1>
        <div className="flex items-center gap-4">
            <button className="px-3 py-1 rounded-md hover:bg-primary/50 transition">Home</button>
            <button className="px-3 py-1 rounded-md hover:bg-primary/50 transition">Profile</button>
            <button className="px-3 py-1 rounded-md hover:bg-primary/50 transition">Settings</button>
        </div>
    </nav>
}