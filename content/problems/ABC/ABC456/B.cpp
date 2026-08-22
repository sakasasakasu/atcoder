#include <bits/stdc++.h>
using namespace std; 

int main() {
    vector<vector<int>> A(3, vector<int>(3, 0));

    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 6; j++) {
            int a;
            cin >> a;
            if (a >= 4 && a <= 6) {
                A.at(i).at(a - 4)++;
            }
        }
    }

    int d[6][3] = {
        {4, 5, 6},
        {4, 6, 5},
        {5, 4, 6},
        {5, 6, 4},
        {6, 4, 5},
        {6, 5, 4}
    };

    long long ans = 0;
    for (int i = 0; i < 6; i++) {
        ans += (long long)A.at(0).at(d[i][0] - 4) * A.at(1).at(d[i][1] - 4) * A.at(2).at(d[i][2] - 4);
    }

    cout << fixed << setprecision(10) << (double)ans / pow(6, 3) << endl;
}