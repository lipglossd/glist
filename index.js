import express from 'express'
const app = express()

app.enable('trust proxy')

app.get('/plist', async (req, res) => {
    const base64Content = req.query.content
    if (!base64Content)
        return res.status(400).send('No content provided')

    try {
        const plistInfo = JSON.parse(Buffer.from(base64Content, 'base64').toString())

        async function getDirectUrl(url) {
            try {
                const response = await fetch(url, { 
                    method: 'HEAD', 
                    redirect: 'manual' 
                })

                if (response.status === 301 || response.status === 302) {
                    const directUrl = response.headers.get('location')
                    
                    if (directUrl && directUrl !== url)
                        return await getDirectUrl(directUrl)
                }

                return response.url
            } catch (error) {
                console.error(error.message)
                return url
            }
        }

        const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>items</key>
        <array>
            <dict>
                <key>assets</key>
                <array>
                    <dict>
                        <key>kind</key>
                        <string>software-package</string>
                        <key>url</key>
                        <string>${await getDirectUrl(plistInfo.ipa_url)}</string>
                    </dict>
                    <dict>
                        <key>kind</key>
                        <string>display-image</string>
                        <key>needs-shine</key>
                        <false/>
                        <key>url</key>
                        <string>https://lipglossd.github.io/${plistInfo.img_url}</string>
                    </dict>
                </array>
                <key>metadata</key>
                <dict>
                    <key>bundle-identifier</key>
                    <string>${plistInfo.bundleId.trim()}</string>
                    <key>bundle-version</key>
                    <string>${plistInfo.version.split(' ')[0].trim()}</string>
                    <key>kind</key>
                    <string>software</string>
                    <key>title</key>
                    <string>${plistInfo.title.trim()}</string>
                </dict>
            </dict>
        </array>
    </dict>
</plist>`.trim()
        
        res.setHeader('Content-Type', 'text/xml; charset=utf-8')
        res.send(plistContent)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
}

export default app