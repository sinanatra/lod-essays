var ghpages = require('gh-pages');
require("dotenv").config()

console.log(process.env.GH_TOKEN)

ghpages.publish(
    'public',
    {
        branch: 'gh-pages',
        silent: true,
        repo: 'https://' + process.env.GH_TOKEN + '@github.com:sinanatra/lod-essays.git',
        user: {
            name: 'Giacomo Nanni',
            email: 'gn.nanni@gmail.com'
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)


