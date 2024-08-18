module.exports = [
  {
    url: '/test',
    method: 'get',
    response: (req) => {
      return {
        code: 0,
        data: {
          name: '@cname',
        },
      }
    },
  },
]
