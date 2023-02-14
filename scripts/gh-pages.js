var ghpages = require('gh-pages');

ghpages.publish(
    'public',
    {
        branch: 'gh-pages',
        silent: true,
        repo: 'https://' + process.env.GITHUB_TOKEN + '@github.com:sinanatra/lod-essays.git',
        user: {
            name: 'Giacomo Nanni',
            email: 'gn.nanni@gmail.com'
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)