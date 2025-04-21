import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Title, Paragraph, List, Menu, Divider, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Meal {
  name: string;
  description: string;
  time?: string;
}

interface DietPlan {
  name: string;
  description: string;
  meals: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snacks: Meal[];
  };
}

export const DietPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [menuVisible, setMenuVisible] = useState(false);

  const dietPlans: Record<string, DietPlan> = {
    mediterranean: {
      name: 'حمية البحر المتوسط',
      description: 'نظام غذائي صحي يعتمد على الأطعمة التقليدية لدول البحر المتوسط',
      meals: {
        breakfast: [
          { name: 'شوفان باللبن', description: 'مع العسل والمكسرات والفواكه المجففة' },
          { name: 'توست الحبوب الكاملة', description: 'مع زيت الزيتون والطماطم' },
        ],
        lunch: [
          { name: 'سلطة يونانية', description: 'خضروات طازجة مع جبنة الفيتا وزيت الزيتون' },
          { name: 'سمك مشوي', description: 'مع الخضروات المشوية والأعشاب' },
        ],
        dinner: [
          { name: 'حساء العدس', description: 'مع الخضروات والليمون' },
          { name: 'فاصوليا مطبوخة', description: 'مع صلصة الطماطم والأعشاب' },
        ],
        snacks: [
          { name: 'زيتون وجبن', description: 'زيتون أسود مع جبنة الفيتا' },
          { name: 'فواكه طازجة', description: 'تين، عنب، برتقال' },
        ],
      },
    },
    keto: {
      name: 'حمية الكيتو',
      description: 'نظام غذائي منخفض الكربوهيدرات وغني بالدهون',
      meals: {
        breakfast: [
          { name: 'بيض مقلي', description: 'مع الأفوكادو والجبن' },
          { name: 'سموثي الكيتو', description: 'جوز الهند، زبدة اللوز، بروتين' },
        ],
        lunch: [
          { name: 'سلطة التونة', description: 'مع المايونيز والخضروات' },
          { name: 'دجاج مشوي', description: 'مع الخضروات المشوية' },
        ],
        dinner: [
          { name: 'سمك سلمون', description: 'مع الأسباراجوس' },
          { name: 'لحم بقري', description: 'مع البروكلي المشوي' },
        ],
        snacks: [
          { name: 'مكسرات', description: 'لوز، جوز، بندق' },
          { name: 'جبن', description: 'شرائح جبن شيدر' },
        ],
      },
    },
    lowCarb: {
      name: 'حمية منخفضة الكربوهيدرات',
      description: 'نظام غذائي يركز على تقليل الكربوهيدرات وزيادة البروتين والدهون الصحية',
      meals: {
        breakfast: [
          { name: 'أومليت', description: 'مع الجبن والفطر والسبانخ' },
          { name: 'لبن زبادي كامل الدسم', description: 'مع المكسرات وبذور الشيا' },
        ],
        lunch: [
          { name: 'صدر دجاج مشوي', description: 'مع سلطة الأفوكادو والخضروات' },
          { name: 'سلطة التونة', description: 'مع البيض المسلوق والخضروات' },
        ],
        dinner: [
          { name: 'سمك السلمون', description: 'مع الهليون والبروكلي المشوي' },
          { name: 'شرائح اللحم', description: 'مع الخضروات المشوية والأفوكادو' },
        ],
        snacks: [
          { name: 'مكسرات متنوعة', description: 'لوز، جوز، بندق' },
          { name: 'شرائح جبن', description: 'مع الزيتون' },
        ],
      },
    },

    paleo: {
      name: 'حمية الباليو',
      description: 'نظام غذائي يحاكي طعام الإنسان في العصر الحجري القديم',
      meals: {
        breakfast: [
          { name: 'عصيدة اللوز', description: 'مع الموز والتوت والعسل الطبيعي' },
          { name: 'بيض مقلي', description: 'مع الأفوكادو والطماطم' },
        ],
        lunch: [
          { name: 'سلطة الدجاج', description: 'مع الخضروات وزيت الزيتون' },
          { name: 'لحم مشوي', description: 'مع البطاطا الحلوة المشوية' },
        ],
        dinner: [
          { name: 'سمك مشوي', description: 'مع الخضروات الموسمية' },
          { name: 'شوربة الخضار', description: 'مع اللحم البقري' },
        ],
        snacks: [
          { name: 'فواكه طازجة', description: 'تفاح، توت، خوخ' },
          { name: 'مكسرات نيئة', description: 'لوز، جوز، كاجو' },
        ],
      },
    },

    intermittentFasting: {
      name: 'الصيام المتقطع',
      description: 'نظام 16/8 - فترة الصيام: 8 مساءً إلى 12 ظهراً (اليوم التالي) | فترة الأكل: 12 ظهراً إلى 8 مساءً',
      meals: {
        breakfast: [
          { name: 'وجبة فتح الصيام', description: 'شوفان مع الموز والعسل', time: '12:00 ظهراً' },
          { name: 'وجبة خفيفة', description: 'توست أفوكادو مع البيض المسلوق', time: '1:30 ظهراً' },
        ],
        lunch: [
          { name: 'الغداء الرئيسي', description: 'صدر دجاج مع الأرز البني والخضار', time: '3:00 عصراً' },
          { name: 'غداء خفيف', description: 'سلطة كينوا مع الحمص والخضروات', time: '3:30 عصراً' },
        ],
        dinner: [
          { name: 'العشاء الرئيسي', description: 'سمك مشوي مع البطاطا المشوية', time: '6:30 مساءً' },
          { name: 'العشاء الخفيف', description: 'شوربة العدس مع الخبز الأسمر', time: '7:00 مساءً' },
        ],
        snacks: [
          { name: 'وجبة خفيفة', description: 'فواكه (تفاح، موز، برتقال)', time: '5:00 مساءً' },
          { name: 'وجبة ما قبل الصيام', description: 'زبادي مع العسل والمكسرات', time: '7:45 مساءً' },
        ],
      },
    },
  };

  const renderMealSection = (title: string, meals: Meal[]) => (
    <Card style={styles.mealCard}>
      <Card.Content>
        <Title>{title}</Title>
          {meals.map((meal, index) => (
            <List.Item
              key={index}
              title={meal.name}
              description={`${meal.description}${meal.time ? ` | الوقت: ${meal.time}` : ''}`}
              left={(props) => <List.Icon {...props} icon="food" />}
            />
        ))}
      </Card.Content>
    </Card>
  );

  const getIconForDiet = (dietKey: string) => {
    const icons: Record<string, string> = {
      keto: 'food-steak',
      mediterranean: 'fish',
      lowCarb: 'bread-slice-outline',
      paleo: 'leaf',
      intermittentFasting: 'clock-outline'
    };
    return icons[dietKey] || 'food';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.menuContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={(
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.menuButton}
              icon={({size, color}) => (
                <Icon 
                  name={selectedPlan ? getIconForDiet(selectedPlan) : 'menu'} 
                  size={size} 
                  color={color}
                />
              )}
            >
              {selectedPlan ? dietPlans[selectedPlan].name : 'اختر نوع الحمية'}
            </Button>
          )}
        >
          {Object.entries(dietPlans).map(([key, plan]) => (
            <Menu.Item
              key={key}
              onPress={() => {
                setSelectedPlan(key);
                setMenuVisible(false);
              }}
              title={plan.name}
              leadingIcon={getIconForDiet(key)}
            />
          ))}
        </Menu>
      </View>

      {selectedPlan && (
        <View>
          <Card style={styles.descriptionCard}>
            <Card.Content>
              <Title>{dietPlans[selectedPlan].name}</Title>
              <Paragraph>{dietPlans[selectedPlan].description}</Paragraph>
            </Card.Content>
          </Card>

          {renderMealSection('الفطور', dietPlans[selectedPlan].meals.breakfast)}
          {renderMealSection('الغداء', dietPlans[selectedPlan].meals.lunch)}
          {renderMealSection('العشاء', dietPlans[selectedPlan].meals.dinner)}
          {renderMealSection('الوجبات الخفيفة', dietPlans[selectedPlan].meals.snacks)}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  menuContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  menuButton: {
    width: '80%',
    marginVertical: 8,
  },
  descriptionCard: {
    marginBottom: 16,
  },
  mealCard: {
    marginBottom: 16,
  },
});
