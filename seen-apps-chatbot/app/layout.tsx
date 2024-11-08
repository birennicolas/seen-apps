import "./global.css"

export const metadata = {
    title: "Seen Apps Chatbot",
    description: "Chatbot for Seen Apps",
}

const RootLayout = ({children}: {children: React.ReactNode}) => {
    return <html lang="en">
        <body>{children}</body>
    </html>
}

export default RootLayout