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

export function App() {
  const [ships, setShips] = React.useState<any>([]);

  React.useEffect(() => {
    (async () => {
      // TODO: restore after api ssl cert is fixed
      // const result = await axios.get('http://localhost:3000/starships');
      const result = {
        data: [
          {
            id: 1,
            name: 'ship1',
            speed: 10,
          },
          {
            id: 2,
            name: 'ship2',
            speed: 11,
          },
        ],
      };
      setShips(result.data);
    })();
  });

  return (
    <Page>
      <Content>
        <h1>Starship racer</h1>
      </Content>
    </Page>
  );
}

export default App;
