

Run the example with 
```shell
npm run example:count
```

Then observe the logs on solana
```shell
solana logs | grep "CTmCRwujH1CEdgcHaugpDzjy7hYJVLeBw86e1A9yY39A invoke" -A 10
```

Below will be the results:
```shell
    Program CTmCRwujH1CEdgcHaugpDzjy7hYJVLeBw86e1A9yY39A invoke [1]
    Program log: Hello, Solana! From Song
    Program log: Debug output:
    Program log: Account ID: {account.key}
    Program log: Executable?: {account.data.borrow()}
    Program log: Lamports: {account.lamports}
    Program log: Debug output complete
    Program log: Greeted 4 time(s)!
    Program CTmCRwujH1CEdgcHaugpDzjy7hYJVLeBw86e1A9yY39A consumed 1367 of 200000 compute units
    Program CTmCRwujH1CEdgcHaugpDzjy7hYJVLeBw86e1A9yY39A success
Transaction executed in slot 328718696:
```