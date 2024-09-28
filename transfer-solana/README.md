# Transfer SOL

Simple example of transferring lamports (SOL).

### Creating the example keypairs:

```shell
solana-keygen new --no-bip39-passphrase -o accounts/ringo.json
```

### Viewing their public keys:

```shell
solana-keygen pubkey accounts/song.json
```

```shell
Song:       8L8EqcceuhczdD592XPZvmX4JWaH3rtE9FHaKmD99R5Y
John:       GXTwGwNYrivcZZyXMgcz7CZPY6gfY5vVJEBbtqtn18a9
```

### Airdropping:

```shell
solana airdrop --keypair accounts/john.json 2
```

### Viewing their balances:

```shell
solana account <pubkey> 
```

## Run the example:

In one terminal:
```shell
npm run reset-and-build
npm run simulation
```

In another terminal:

(My progam id is: `8EUf92VmkrqkUcf1wX1zoxuWLLPbBQfew9QXPxxC7QGX`)
```shell
solana logs | grep "<program id> invoke" -A 7
```