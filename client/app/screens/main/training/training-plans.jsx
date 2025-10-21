import { Image } from "expo-image";
import { useContext, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppScroll from "../../../components/screen-comps/app-scroll";
import AppText from "../../../components/screen-comps/app-text";
import FloatingActionButton from "../../../components/screen-comps/floating-action-button";
import { Images } from "../../../common/settings/assets";
import { UserContext } from '../../../common/contexts/user-context';
import usePopups from "../../../common/hooks/use-popups";
import { scaleFont } from "../../../common/utils/scale-fonts";
import APIService from "../../../common/services/api-service";
import { colors,} from "../../../common/settings/styling";
import { router, useLocalSearchParams } from 'expo-router';
import { routes } from '../../../common/settings/constants';
import MealPlan from '../../../components/screen-comps/meal-plan';

export default function TrainingPlans() {
    const context = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const { createInput, showSpinner, hideSpinner, createToast, createDialog, createAlert } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const [scrollToTop, setScrollToTop] = useState(false);
    const [fabVisible, setFabVisible] = useState(true);

    async function handlePlanAddition() {
        
    }

    async function handlePlanDeletion(plan) {
        
    }

    async function handlePlanUpdate(plan) {
        
    }

    async function handlePlanImport(plan) {
    }

    async function handlePlanPress(selectedPlanId) {
       
    }

    return (
        <>
            <FloatingActionButton
                onPress={() => setScrollToTop(true)}
                visible={!fabVisible}
                position={{ bottom: insets.bottom + 50, left: 20 }}
                icon={Images.arrow}
                iconStyle={{ transform: [{ rotate: '-90deg' }], marginBottom: 2 }}
                iconSize={20}
                size={40}
            />

            <FloatingActionButton
                onPress={handlePlanAddition}
                visible={fabVisible}
                position={{ bottom: insets.bottom + 50, right: 20 }}
                icon={Images.plus}
                iconStyle={{ transform: [{ rotate: '-90deg' }], marginBottom: 2 }}
            />

            <AppScroll avoidKeyboard={false} extraBottom={250} onScrollSetStates={[setFabVisible, () => setScrollToTop(false)]} scrollToTop={scrollToTop}>
                {user.plans?.length > 0 ?
                    <View>
                        {user.plans.map((plan, i) => (
                            <MealPlan
                                key={plan.id}
                                date={plan.dateOfCreation}
                                label={plan.label}
                                description={plan.description}
                                planId={plan.id}
                                meals={plan.meals}
                                isCreatedByCoach={plan.isCreatedByCoach}
                                coachId={plan.coachId}
                                expandedOnStart={i === 0}
                                showImportButton={context.mealPlansIntent === 'import'}
                                onImportPlanPress={() => handlePlanImport(plan)}
                                onDeletePress={() => handlePlanDeletion(plan)}
                                onUpdatePress={() => handlePlanUpdate(plan)}
                                onPlanPress={() => handlePlanPress(plan.id)}
                            />
                        ))}
                    </View>
                    :
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <Image source={Images.list3Outline} style={{ width: 120, height: 120, tintColor: colors.mutedText + '99' }} />
                        <AppText style={{ fontSize: scaleFont(16), color: colors.mutedText, textAlign: 'center', fontWeight: 'bold', marginTop: 20 }}>
                            You have no meal plans
                        </AppText>
                        <AppText style={{ fontSize: scaleFont(14), color: 'white', textAlign: 'center', marginTop: 5 }}>
                            Tap on plus the "+" to add new meal plan
                        </AppText>
                    </View>}
            </AppScroll >
        </>
    );
}