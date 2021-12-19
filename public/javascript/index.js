var calling = false;
window.onscroll = function (ev) {
  if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
    if (calling === false) {
      calling = true;
      axios.post('/next').then((newPokemon) => {
        newPokemon.data.pokemon.forEach((pokemon) => {
          // card
          let card = document.createElement('div');
          card.className = 'card';

          //image
          let image = document.createElement('img');
          image.className = 'image';
          image.src = pokemon.sprite;
          image.alt = pokemon.name;

          //bottom of card
          let bottom = document.createElement('div');
          bottom.className = 'bottom';
          let name = document.createElement('p');
          name.className = 'name';
          name.innerHTML = pokemon.name + ' - # ' + pokemon.id;

          //types
          let typeDiv = document.createElement('div');
          typeDiv.className = 'types';
          pokemon.types.forEach((type) => {
            let p = document.createElement('p');
            p.className = type;
            p.innerHTML = type;
            typeDiv.append(p);
          });
          bottom.append(name);
          bottom.append(typeDiv);
          card.append(image);
          card.append(bottom);
          document.getElementById('container').append(card);
        });
      });
      setTimeout(() => {
        calling = false;
      }, 250);
    }
  }
};
