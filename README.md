# DraftDiff

You know DraftKings? Its like that but for my friends league of legends games.

List of things I still need to implement / maybe will implement:

- Fix major bugs and complete a final walkthrough
- Have the bot send a message when a game is over and saying who won and how many points were lost/gained.
- If a player wins the game they were playing, they should gain at least double the amount of points they wagered.
- A "mailbox" system so users can see their transactions and active bets.
- A command that sends money from one user to another
- Virtual slot machine that a user can punt points on
- Virtual reward shop for redeeming points.
- Command that showcases all active games.
- Find a way to host this all not on my laptop.

# Current Bugs
- Bet Message double sending when I am the one playing
- Race condition when multiple people start a game at the same time
- Change daily reward to be a timeout polling instead of waiting for them to leave vc