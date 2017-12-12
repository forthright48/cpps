const fourDigits = '\\d{4}';

// TODO: Show full names in bracket
module.exports = {
  data: [
    {
      displayName: 'Codeforces',
      name: 'cf',
      format: '^\\d+[A-Z]$',
    },
    // {name: 'CC'},
    // {name: 'CSA'},
    // {name: 'FHC'},
    // {name: 'GCJ'},
    // {name: 'HR'},
    // {name: 'HE'},
    {
      name: 'hdu',
      displayName: 'HDU',
      format: fourDigits,
    },
    // {name: 'LC'},
    // {
    //   name: 'LOJ',
    //   format: fourDigits,
    // },
    {
      name: 'poj',
      displayName: 'POJ',
      format: fourDigits,
    },
    {
      displayName: 'SPOJ',
      name: 'spoj',
      format: '^[A-Z0-9_]+$',
    },
    // {name: 'TJU'},
    // {name: 'Toph'},
    // {
    //   name: 'URAL',
    //   format: fourDigits,
    // },
    // {name: 'URI'},
    {
      displayName: 'UVa Online Judge',
      name: 'uva',
      format: '^\\d{3,5}$', //3 to 5 digits
    },
    // {name: 'UVaLive'},
    // {name: 'ZOJ'},
  ],
};
