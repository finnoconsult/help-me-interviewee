import styled from '@emotion/styled';
import axios from 'axios';
import React from 'react';

const Page = styled.div`
  width: 100vw;
  height: 100vh;
  display: grid;
  place-items: center;
`;

const Content = styled.div``;

const Layout = styled.div`
  display: flex;
  flex-direction: row;
  flex: 0, 0, 50%;
  height: 80%;
`;

const ShipList = styled.ul`
  background-color: lightgray;
  border-radius: 14px;
  padding: 14px;
  margin: 14px;

  list-style-type: none;

  li {
    margin: 10px 0;
    cursor: pointer;
  }
`;

const Race = styled.div``;

const Racer = styled.div`
  background-color: lightgray;
  border-radius: 14px;
  padding: 14px;
  margin: 14px;
`;

const Button = styled.button`
  background-color: red;
  color: white;
  box-shadow: none;
  border: none;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  margin: 14px;
  padding: 14px;
  background-color: blue;
  color: white;
  box-shadow: none;
  border: none;
  cursor: pointer;
`;

const Result = styled.p`
  text-align: center;
`;

export function App() {
  const [areShipsLoading, setAreShipsLoading] = React.useState(false);
  const [ships, setShips] = React.useState<any>([]);

  const [isRacerALoading, setIsRacerALoading] = React.useState(false);
  const [isRacerBLoading, setIsRacerBLoading] = React.useState(false);
  const [racerA, setRacerA] = React.useState<any>(null);
  const [racerB, setRacerB] = React.useState<any>(null);

  const [isWinnerLoading, setIsWinnerLoading] = React.useState(false);
  const [winner, setWinner] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      setAreShipsLoading(true);
      const result = await axios.get('http://localhost:3000/starships');
      setShips(result.data.ships);
      setAreShipsLoading(false);
    })();
  }, []);

  return (
    <Page>
      <Content>
        <h1>Starship racer</h1>
        <Layout>
          <ShipList>
            {areShipsLoading ? 'Loading...' : null}
            {!areShipsLoading && ships && ships.length > 0
              ? ships.map((ship: any) => (
                  <li
                    onClick={async () => {
                      if (!racerA) {
                        setIsRacerALoading(true);
                        const racer = await axios.get(
                          `http://localhost:3000/starships/${ship.id}`
                        );
                        setIsRacerALoading(false);
                        setRacerA(racer.data.ship);
                      } else if (!racerB) {
                        setIsRacerBLoading(true);
                        const racer = await axios.get(
                          `http://localhost:3000/starships/${ship.id}`
                        );
                        setIsRacerBLoading(false);
                        setRacerB(racer.data.ship);
                      }
                    }}
                  >
                    {ship.name}
                  </li>
                ))
              : null}
          </ShipList>
          <Race>
            {!isRacerALoading && racerA ? (
              <Racer>
                <h2>{racerA.name}</h2>
                <Button
                  onClick={() => {
                    setRacerA(null);
                    setWinner(null);
                  }}
                >
                  Remove
                </Button>
                <p>{`speed: ${racerA.max_atmosphering_speed}`}</p>
                <p>{`price: ${racerA.cost_in_credits}`}</p>
              </Racer>
            ) : null}
            {!isRacerBLoading && racerB ? (
              <Racer>
                <h2>{racerB.name}</h2>
                <Button
                  onClick={() => {
                    setWinner(null);
                    setRacerB(null);
                  }}
                >
                  Remove
                </Button>
                <p>{`speed: ${racerB.max_atmosphering_speed}`}</p>
                <p>{`price: ${racerB.cost_in_credits}`}</p>
              </Racer>
            ) : null}
            {!isRacerALoading && !isRacerBLoading && racerA && racerB && (
              <>
                <SubmitButton
                  disabled={isWinnerLoading}
                  onClick={async () => {
                    setIsWinnerLoading(true);
                    const result = await axios.post(
                      `http://localhost:3000/starships/race`,
                      {
                        idA: racerA.id,
                        idB: racerB.id,
                      },
                      {
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      }
                    );
                    setIsWinnerLoading(false);
                    setWinner(result.data.winner);
                  }}
                >
                  Race!
                </SubmitButton>
                {winner && <Result>{`The winner is: ${winner.name}`}</Result>}
              </>
            )}
          </Race>
        </Layout>
      </Content>
    </Page>
  );
}

export default App;
