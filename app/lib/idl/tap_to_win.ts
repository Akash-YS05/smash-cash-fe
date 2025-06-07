/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/tap_to_win.json`.
 */
export type TapToWin = {
    "address": "CTvpChrJqAhxAPQPMU2pJk8RcnzLwTJ5s7BJHftzS7vZ",
    "metadata": {
      "name": "tapToWin",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "createPlayer",
        "discriminator": [
          19,
          178,
          189,
          216,
          159,
          134,
          0,
          192
        ],
        "accounts": [
          {
            "name": "player",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    108,
                    97,
                    121,
                    101,
                    114
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "gameState",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    103,
                    97,
                    109,
                    101,
                    95,
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "getLeaderboardInfo",
        "discriminator": [
          3,
          46,
          194,
          177,
          180,
          146,
          152,
          250
        ],
        "accounts": [
          {
            "name": "gameState",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    103,
                    97,
                    109,
                    101,
                    95,
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          }
        ],
        "args": []
      },
      {
        "name": "initialize",
        "discriminator": [
          175,
          175,
          109,
          31,
          13,
          152,
          155,
          237
        ],
        "accounts": [
          {
            "name": "gameState",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    103,
                    97,
                    109,
                    101,
                    95,
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "submitScore",
        "discriminator": [
          212,
          128,
          45,
          22,
          112,
          82,
          85,
          235
        ],
        "accounts": [
          {
            "name": "player",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    112,
                    108,
                    97,
                    121,
                    101,
                    114
                  ]
                },
                {
                  "kind": "account",
                  "path": "authority"
                }
              ]
            }
          },
          {
            "name": "gameState",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    103,
                    97,
                    109,
                    101,
                    95,
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true
          }
        ],
        "args": [
          {
            "name": "score",
            "type": "u64"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "gameState",
        "discriminator": [
          144,
          94,
          208,
          172,
          248,
          99,
          134,
          120
        ]
      },
      {
        "name": "player",
        "discriminator": [
          205,
          222,
          112,
          7,
          165,
          155,
          206,
          218
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "invalidScore",
        "msg": "Score must be greater than 0."
      }
    ],
    "types": [
      {
        "name": "gameState",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "totalPlayers",
              "type": "u64"
            },
            {
              "name": "totalGames",
              "type": "u64"
            },
            {
              "name": "topScore",
              "type": "u64"
            },
            {
              "name": "topPlayer",
              "type": {
                "option": "pubkey"
              }
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "player",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "wallet",
              "type": "pubkey"
            },
            {
              "name": "totalGames",
              "type": "u64"
            },
            {
              "name": "highScore",
              "type": "u64"
            },
            {
              "name": "lastPlayed",
              "type": "i64"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      }
    ]
  };
  