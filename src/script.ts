import { redirectToAuthCodeFlow, getAccessToken } from './authCodeWithPkce';

const clientId = import.meta.env.VITE_CLIENT_ID;
const params = new URLSearchParams(window.location.search);
const code = params.get('code');

let accessToken;

if (!code) {
  redirectToAuthCodeFlow(clientId);
} else {
  accessToken = await getAccessToken(clientId, code);
  const profile = await fetchProfile(accessToken);
  const followedArtists = await fetchFollowedArtists(accessToken);
  // populateUI(profile);
  test(profile.id);
  console.log(followedArtists);
}

async function fetchProfile(token: string): Promise<UserProfile> {
  const result = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

async function fetchFollowedArtists(token: string): Promise<FollowedArtistsResponse> {
  const result = await fetch('https://api.spotify.com/v1/me/following?type=artist', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return await result.json();
}

function populateUI(profile: UserProfile) {
  document.getElementById('displayName')!.innerText = profile.display_name;
  if (profile.images[0]) {
    const profileImage = new Image(200, 200);
    profileImage.src = profile.images[0].url;
    document.getElementById('avatar')!.appendChild(profileImage);
  }
  document.getElementById('id')!.innerText = profile.id;
  document.getElementById('email')!.innerText = profile.email;
  document.getElementById('uri')!.innerText = profile.uri;
  document.getElementById('uri')!.setAttribute('href', profile.external_urls.spotify);
  document.getElementById('url')!.innerText = profile.href;
  document.getElementById('url')!.setAttribute('href', profile.href);
  document.getElementById('imgUrl')!.innerText = profile.images[0]?.url ?? '(no profile image)';
}

function test(profileID: string) {
  const followingButton = document.createElement('a');
  followingButton.textContent = "Open 'Following' Page";
  followingButton.target = '_blank';
  followingButton.href = `https://open.spotify.com/user/${profileID}/following`;
  document.querySelector('body')!.appendChild(followingButton);
}

document.querySelector('form button')?.addEventListener('click', submitInput);

function submitInput(e: Event) {
  const input: Element = e.target?.form.querySelector('input');
  const userIDsArr: string[] = treatInputValue(input.value);
  renderUserList(userIDsArr);
}

function treatInputValue(invalue: string) {
  const regex = 'spotify.com/user/';

  const temp = invalue.slice(1, -1).split(',');
  const result = temp.map((x) => {
    const t = x.trim().slice(1, -1);
    return t.substring(t.search(regex) + regex.length);
  });
  return result;
}

function renderUserList(userIDsArr: string[]) {
  if (!userIDsArr || (userIDsArr.length == 1 && !userIDsArr[0])) {
    return;
  }

  
  const form = document.createElement('form');
  form.classList.add('user-list');

  const fieldset = document.createElement('fieldset');

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Unfollow selected';

  const counterDiv = document.createElement('div');
  counterDiv.textContent = 'Selected: ';
  const counterSpan = document.createElement('span');
  counterSpan.classList.add('count');
  counterSpan.textContent = '0';
  const counterEnd = document.createElement('span');
  counterEnd.textContent = '/50';
  counterDiv.appendChild(counterSpan);
  counterDiv.appendChild(counterEnd);

  userIDsArr.forEach(async (userID) => {
    const result = await fetch(`https://api.spotify.com/v1/users/${userID}
`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  
    const user: UserProfile = await result.json(); 
    console.log(user);

    const userCard = document.createElement('div');
    const userImage = document.createElement('img');
    userImage.src = user.images[1].url;
    const userInputContainer = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = userID;
    input.id = userID;

    const label = document.createElement('label');
    label.htmlFor = userID;
    label.textContent = user.display_name;

    userInputContainer.appendChild(input);
    userInputContainer.appendChild(label);
    userCard.appendChild(userImage);
    userCard.appendChild(userInputContainer);


    input.addEventListener("change", (e) => {
      const counterElement = document.querySelector(".count");
      let count = parseInt(counterElement?.textContent);
      e.target.checked ? count++ : count--;
      counterElement.textContent = count;
    })



    fieldset.appendChild(userCard);
  });

  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const counterElement = document.querySelector(".count");
    const count = parseInt(counterElement?.textContent);
    if (count > 50) { 
      alert('Select up to 50 users!');
      return;
    }

    const selectedUsers = userIDsArr.filter((userID) => document.getElementById(userID).checked);

    if (selectedUsers.length === 0) {
      alert('No users selected for deletion.');
      return;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/following?type=user', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ ids: selectedUsers }),
      });

      if (response.ok) {
        alert('Users deleted successfully!');
      } else {
        alert('Failed to delete users.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while deleting users.');
    }
  });

  fieldset.appendChild(submitButton);
  fieldset.appendChild(counterDiv);
  form.appendChild(fieldset);
  document.body.appendChild(form);
}
