import express from 'express'
const app = express()

app.enable('trust proxy')

app.get('/plist', (req, res) => {
    const base64Content = req.query.content
    if (!base64Content)
        return res.status(400).send('No content provided')

    try {
        const plistInfo = JSON.parse(Buffer.from(base64Content, 'base64').toString('utf-8'))
        const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>items</key><array><dict><key>assets</key><array><dict>
<key>kind</key><string>software-package</string>
<key>url</key><string>${plistInfo.ipa_url}</string>
</dict><dict>
<key>kind</key><string>display-image</string>
<key>needs-shine</key><false/>
<key>url</key><string>${plistInfo.img_url}</string>
</dict></array><key>metadata</key><dict>
<key>bundle-identifier</key><string>${plistInfo.bundleId}</string>
<key>bundle-version</key><string>${plistInfo.version.split(' ')[0]}</string>
<key>kind</key><string>software</string>
<key>title</key><string>${plistInfo.title}</string>
</dict></dict></array></dict></plist>`.trim()
        
        res.setHeader('Content-Type', 'text/xml charset=utf-8')
        return res.send(plist)
    } catch (e) {
        return res.status(400).send('Invalid base64 data')
    }
})

if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
}

export default app