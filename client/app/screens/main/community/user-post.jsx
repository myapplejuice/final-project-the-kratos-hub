import * as FileSystem from 'expo-file-system/legacy';
import { Image, ImageBackground } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Keyboard, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import BuildFooter from "../../../components/layout-comps/build-footer";
import AppText from "../../../components/screen-comps/app-text";
import { Images } from '../../../common/settings/assets';
import { UserContext } from "../../../common/contexts/user-context";
import { formatDate, formatTime, getDayComparisons, getHoursComparisons } from '../../../common/utils/date-time';
import usePopups from "../../../common/hooks/use-popups";
import { scaleFont } from "../../../common/utils/scale-fonts";
import DeviceStorageService from '../../../common/services/device-storage-service';
import APIService from '../../../common/services/api-service';
import { routes } from "../../../common/settings/constants";
import { colors } from "../../../common/settings/styling";
import Divider from '../../../components/screen-comps/divider';
import AppScroll from '../../../components/screen-comps/app-scroll'
import ImageCapture from '../../../components/screen-comps/image-capture';
import { CameraContext } from '../../../common/contexts/camera-context';
import { LibraryContext } from '../../../common/contexts/library-context';
import AnimatedButton from '../../../components/screen-comps/animated-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Invert from '../../../components/effects/invert';
import ExpandInOut from '../../../components/effects/expand-in-out';
import AppTextInput from '../../../components/screen-comps/app-text-input';
import CommunityPost from '../../../components/screen-comps/community-post';
import FloatingActionMenu from '../../../components/screen-comps/floating-action-menu';
import FloatingActionButton from '../../../components/screen-comps/floating-action-button';
import Gallery from '../../../components/screen-comps/gallery';

export default function UserPost() {
    const params = useLocalSearchParams();
    let post = JSON.parse(params.post);

    

    return (
        <>
            <AppScroll hideNavBarOnScroll={true} extraBottom={100} extraTop={60}>
                <CommunityPost
                    isUserPost={true}
                    post={post}
                />
            </AppScroll>
        </>
    );
}