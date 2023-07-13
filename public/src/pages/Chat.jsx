import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {allUsersRoute,host} from "../utils/APIRoutes";
import Contacts from "../components/Contacts"
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import { io } from "socket.io-client"
export default function Chat() {
    const socket = useRef();
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [currentUser, setCurrentUser] = useState(undefined);
    const [currentChat, setCurrentChat] = useState(undefined);
    //用户是否已加载
    const [isLoaded, setIsLoaded] = useState(false);
    //getCurrentUser
    const getCurrentUser = async () => {
        setCurrentUser(JSON.parse(localStorage.getItem(("chat-app-user"))));
    }
    useEffect(() => {
        if (!localStorage.getItem('chat-app-user')) {
            navigate('/login');
        } else {
            getCurrentUser();
            setIsLoaded(true);
        }
    }, [])
    //socket.io
    useEffect(()=>{
        if(currentUser){
            socket.current = io(host);
            socket.current.emit('add-user',currentUser._id);
        }
    })
    //getAllUser
    const getAllUser = async () => {
        const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
        setContacts(data.data);
    }
    useEffect(() => {
        //检查当前用户是否存在
        if (currentUser) {
            //检查头像是否已设置
            if (currentUser.isAvatarImageSet) {
                //从服务器获取数据
                getAllUser();
            } else {
                navigate("/setAvatar")
            }
        }
    }, [currentUser])
    //手动改变和谁聊天
    const handleChatChange = (chat) => {
        setCurrentChat(chat);
    };
    return (
        <>
            <Container>
                <div className="container">
                    <Contacts contacts={contacts} currentUser={currentUser} changeChat={handleChatChange}/>
                    {
                        isLoaded && currentChat === undefined ? (
                            <Welcome currentUser={currentUser}/>
                        ) : (
                            <ChatContainer currentChat={currentChat} currentUser={currentUser} socket={socket}/>
                        )
                    }
                </div>
            </Container>
        </>
    )
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;

  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
