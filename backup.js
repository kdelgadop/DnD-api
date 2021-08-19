const init5e = async (filter) => {

  let toggleAction = document.querySelector("input[type='checkbox']");
  toggleAction.addEventListener('change', function() {
    this.value = this.checked ? true : false;
  });
  let toggleAbility = document.querySelector("input[class='abilities']");
  toggleAbility.addEventListener('change', function() {
    this.value = this.checked ? true : false;
  })

  const getMonsters = async() => {
    clearTable();
    const area = document.getElementById("monster-list")
    let loader = `<div class="loader" id ="loader"></div> `;
    area.insertAdjacentHTML('beforeend', loader)

    const monsterArray = [];
    let cr = document.getElementById("cr").value;
      try {
        const response = await fetch(`https://www.dnd5eapi.co/api/monsters?challenge_rating=${cr}`);
        if(response.ok) {
          const jsonResponse = await response.json();
          const results = jsonResponse.results

          //FETCH THE MONSTER ARRAY FROM THE MONSTER OBJECT ARRAY BY CR
          for (let i = 0; i < jsonResponse.count; i++) {
            let index = results[i].index
            const monsters = await fetch(`https://www.dnd5eapi.co/api/monsters/${index}`);
            if(monsters.ok) {
              const jsonMonster = await monsters.json();
              monsterArray.push(jsonMonster);
            }
          }
          return monsterArray;
        }
      } catch (error) {
          clearTable();
          console.log(error);
          //create a Div that let the user know something went wrong
          const area = document.getElementById("monster-list")
          const errorDiv = document.createElement("error");
          errorDiv.id = "table";
          area.appendChild(errorDiv);
          let errorMessage = `
            <p>Oh no!</p>
            <p>An error has occured :(</p>`;
            errorDiv.insertAdjacentHTML('beforeend', errorMessage);
      }
  };

    //Generate the table in the HTML page
  const generateTable = (mtrArray) => {
      clearTable();

      const area = document.getElementById("monster-list")
      const newDiv = document.createElement("table");
      newDiv.id = "table";
      newDiv.className = "darkTable";
      area.appendChild(newDiv);

      let tHCounter = 0;
      mtrArray.forEach(e => {

        const actionsLength = e.actions.length;
        let htmlAct = [];
        let htmlAbl = [];
        let legActions;

        if(e.legendary_actions){
          legActions = `${e.legendary_actions.length}`;
        }
        else {
          legActions = 0;
        };
        
        let tHeadding = 
        `<tr>
          <th onclick="init5e()" id="selector">Name</th>
          <th onclick="init5e('Size')" id="selector">Size</th>
          <th onclick="init5e('AC')" id="selector">AC</th>
          <th onclick="init5e('HP')" id="selector">Hit Points</th>
          <th onclick="init5e('LA')" id="selector">Legendary actions</th>`;

        let htmlStats = 
        `<tr>
          <td>${e.name}</td>
          <td>${e.size}</td>
          <td>${e.armor_class}</td>
          <td>${e.hit_points}</td>
          <td>${legActions}</td>`;


        if (toggleAction.value === "true" && toggleAbility.value === "true") {

          for (let i = 0; i < actionsLength; i++) {
            htmlAct.push(`<td>${e.actions[i].name}: ${e.actions[i].desc}</td>`);
          }

          if (e.special_abilities !== undefined) {
            const abilitiesLength = e.special_abilities.length;
            tHeadding += 
            `
                  <th colspan=${abilitiesLength.toString()}>Abilities</th>
                  <th colspan=${actionsLength.toString()}>Actions</th>
              </tr>`;

              for (let j = 0; j < abilitiesLength; j++) {
                htmlAbl.push(`<td>${e.special_abilities[j].name}: ${e.special_abilities[j].desc}</td>`);
              }
          }
          else {
          tHeadding += 
          `
                <th colspan=${actionsLength.toString()}>Actions</th>
            </tr>`;
          };
        }
        
        else if (toggleAction.value === "true") {
          tHeadding += 
          `
                <th colspan=${actionsLength.toString()}>Actions</th>
            </tr>`;

            for (let i = 0; i < actionsLength; i++) {
              htmlAct.push(`<td>${e.actions[i].name}: ${e.actions[i].desc}</td>`);
            }
        }

        else if (toggleAbility.value === "true" && e.special_abilities !== undefined) {
        const abilitiesLength = e.special_abilities.length;
        tHeadding += 
          `
              <th colspan=${abilitiesLength.toString()}>Abilities</th>
          </tr>`;

            for (let i = 0; i < abilitiesLength; i++) {
              htmlAbl.push(`<td>${e.special_abilities[i].name}: ${e.special_abilities[i].desc}</td>`);
            }
        }

        else if (tHCounter === 0){
          tHeadding += 
            `
              </tr>`;
          newDiv.insertAdjacentHTML('beforeend', tHeadding);
        }

        if (toggleAction.value === "true" || toggleAbility.value === "true") {
          newDiv.insertAdjacentHTML('beforeend', tHeadding+htmlStats+htmlAbl.join('')+htmlAct.join('')+"</tr>");
        }

        else {
          newDiv.insertAdjacentHTML('beforeend', htmlStats);
        };

        tHCounter++;

      });
  };

//Helper Function to Clear the table before writing anything
  const clearTable = () => {
    const area = document.getElementById("monster-list");
    area.innerHTML = '';
      };

  if (filter === undefined) {
    let monsterByCr = await getMonsters();
    generateTable(monsterByCr);
  }
  else if (filter === "AC") {
    let monsterByCr = await getMonsters();
    let sortedAC = await sortByAC(monsterByCr);
    generateTable(sortedAC);
  }
  else if(filter === 'HP') {
    let monsterByCr = await getMonsters();
    let sortedHP = await sortByHP(monsterByCr);
    generateTable(sortedHP);
  }
  else if(filter === 'Size') {
    let monsterByCr = await getMonsters();
    let sortedSz = await sortBySize(monsterByCr);
    generateTable(sortedSz);
  }
  else if(filter === 'LA') {
    let monsterByCr = await getMonsters();
    let sortedLA = await sortByLA(monsterByCr);
    generateTable(sortedLA);
  }

  function sortByAC(sortedArray){
    function compareAC(a, b){
      if(a.armor_class < b.armor_class){
            return 1;
    } else if(a.armor_class > b.armor_class){
            return -1;
    } else{
            return 0;
    }
    }
    return sortedArray.sort(compareAC);
  }

function sortByHP(sortedArray){
    function compareHP(a, b){
      if(a.hit_points < b.hit_points){
            return 1;
    } else if(a.hit_points > b.hit_points){
            return -1;
    } else{
            return 0;
    }
    }
    return sortedArray.sort(compareHP);
  }

function sortBySize(sortedArray){
sortedArray.forEach(e => {
    if(e.size === "Gargantuan"){
      e.sizeCounter = 5;
  } else if(e.size === "Huge"){
      e.sizeCounter = 4;
  } else if(e.size === "Large"){
      e.sizeCounter = 3;
  } else if(e.size === "Medium"){
      e.sizeCounter = 2;
  } else if(e.size === "Small"){
      e.sizeCounter = 1;
  } else{
      e.sizeCounter = 0;
  }
});
    function compareSize(a, b){
      if(a.sizeCounter < b.sizeCounter){
              return 1;
    } else if(a.sizeCounter > b.sizeCounter){
              return -1;
    } else {
              return 0;
    }
    }
    return sortedArray.sort(compareSize);
}

async function sortByLA(sortedArray){
  function compareLA(a, b){
    // if (typeof(a.legendary_actions.length) === "number"  && typeof(b.legendary_actions.length) === "number" )
    if (a.legendary_actions === undefined && b.legendary_actions === undefined) {
      a.legendary_actions = [];
      b.legendary_actions = [];
    }
    else if(a.legendary_actions === undefined) {
      a.legendary_actions = [];
    }
    else if (b.legendary_actions === undefined) {
      b.legendary_actions = [];
    }
      if(a.legendary_actions.length < b.legendary_actions.length){
            return 1;
      } else if(a.legendary_actions.length > b.legendary_actions.length){
            return -1;
      } else{
            return 0;
      }
}
  return sortedArray.sort(compareLA);
}
};