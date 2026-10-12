# Multiplayer blackjack notes

Select **Play Mode → Multiplayer**, enter a nickname, then **Start Game** or
**Join Game**. The host shares a six digit room ID. There are seven player seats;
the host always receives the center chair opposite the non-player dealer.

Players place bets before the host clicks **Deal Round**. Everyone with a bet
plays against the same dealer. The dealer finishes after all those players stand,
reach 21, bust, or leave. Wins pay 1:1, pushes return the stake, and the dealer
stands on all 17s. Joining during a hand waits until the next betting round.
The host starts the next round and may reset balances between hands or kick
guests. **End Game** closes connections and clears the session.

Session wallets start at 100 and exist only in memory. This mode does not use
online wallet APIs, offline wallet actions, login, daily claims, or persistent
scores. Reloading or leaving discards the session wallet; host migration and
reconnection to an old wallet are not implemented.

## Controls

- WASD / arrow keys: camera-relative walking and strafing.
- Space: jump while standing with pointer lock (release and press again for another jump).
- Mouse: look while standing with pointer lock.
- V: first / third person.
- E: stand up, or sit near your assigned table chair or an available barstool.
- Esc: release the cursor; click the scene to capture it again.
- Hit / Stand recapture the pointer only when standing in Player Mode.
- Seated players keep their cursor. Right-drag the scene to look around.

Player Mode can be disabled to use the existing orbit camera. The UAL model is
copied from usa-tycoon's optimized `UAL1_Standard-transformed.glb`; `Player.jsx`
clones its skeleton and uses `Idle_Loop`, `Walk_Loop`, `Jump_Start`, `Jump_Loop`,
`Jump_Land`, and sitting animation 30. Jump takeoff and landing are one-shot
animations; the airborne clip loops, and walking blends through the landing.
The same Player and Dealer render in the Online and Offline 3D scenes.

The 3D room runs inside Rapier Physics. Furniture and room boundaries use fixed
rigid bodies, and the local player uses an upright dynamic capsule. Rapier handles
gravity, wall sliding, furniture contact and landing; jump animations retain the
reference controller's 0.2-second grounded cooldown. Seated players disable their
capsule until standing. Esc and disabling Player Mode stop input while gravity
continues. Leaving 3D preserves the last pose until the simulation mounts again.
The bar uses separate mesh colliders to keep the bartender aisle open. Furniture
positions are unchanged. `useStore.debug` toggles the physics collider overlay.
Multiplayer replicates resolved position, grounded state and animation; remote
avatars are visual replicas, without a second physical simulation. The host
validates the room bounds and seat permissions, not client physics contacts.

## Implementation

`hooks/usePeerStore.js` owns PeerJS lifecycle, the host-authoritative game state,
seat validation, and movement replication. Clients send actions; only the host
deals cards, assigns seats, and changes balances. Hidden cards and the deck stay
in host memory. Peer IDs include an application/protocol prefix before the room
number. PeerJS uses its default signaling and ICE configuration; connectivity
still depends on the participants' networks.

`playerSeats.js` is the shared seat layout. `Players.jsx` renders remote models;
`PlayerController.jsx` controls the local model. `MultiplayerTable.jsx` places
hands and chair labels. Multiplayer UI and leaderboard are separate from the
Online and Offline pages.
